import { Commander, ctl, pkg } from '@scola/ssh';
import { resolveMigration } from '../helper';

export default function createMysql({
  restart = false,
  restrict = false,
  secure = false,
  add = null,
  create = null,
  install = null,
  migrate = null,
  replicate = null,
  root = {},
}) {
  const installer = new Commander({
    description: 'Install mysql',
    decide: () => {
      return install !== null;
    },
    command: () => {
      const commands = [];

      if (install.server) {
        commands.push(`curl -OL https://dev.mysql.com/get/mysql-apt-config_${install.version}.deb`);
        commands.push(`DEBIAN_FRONTEND=noninteractive dpkg -i mysql-apt-config_${install.version}.deb`);
        commands.push(pkg('update'));
        commands.push(`rm mysql-apt-config_${install.server}.deb`);
        commands.push(pkg('install', 'mysql-server'));
      }

      if (install.router) {
        commands.push(pkg('install', 'mysql-router'));
      }

      return commands;
    }
  });

  const restrictor = new Commander({
    description: 'Restrict mysql root access',
    quiet: true,
    decide: () => {
      return restrict === true;
    },
    command: () => {
      const query = [
        'SET SQL_LOG_BIN = OFF',
        'SET GLOBAL SUPER_READ_ONLY = OFF',
        `ALTER USER "${root.username}"@"localhost" IDENTIFIED WITH mysql_native_password BY "${root.password}"`,
        'SET SQL_LOG_BIN = ON'
      ];

      return `mysql -u ${root.username} -N -B -e '${query.join(';')}'`;
    }
  });

  const securer = new Commander({
    description: 'Secure mysql',
    decide: () => {
      return secure === true;
    },
    command: () => {
      const query = [
        'SET SQL_LOG_BIN = OFF',
        'SET GLOBAL SUPER_READ_ONLY = OFF',
        `DELETE FROM mysql.user WHERE User="${root.username}" AND Host NOT IN ("localhost", "127.0.0.1", "::1")`,
        'DELETE FROM mysql.user WHERE User=""',
        'DROP DATABASE IF EXISTS test',
        'SET SQL_LOG_BIN = ON'
      ];

      return `mysql -u ${root.username} -p -e '${query.join(';')}'`;
    },
    answers: (box, data, line) => {
      return line.match(/password:$/) ?
        root.password :
        null;
    }
  });

  const adder = new Commander({
    description: 'Add mysql user',
    decide: () => {
      return add !== null;
    },
    command: () => {
      const query = [
        'SET SQL_LOG_BIN = OFF',
        'SET GLOBAL SUPER_READ_ONLY = OFF'
      ];

      add.forEach(({ extra = '', host, username, password, privileges }) => {
        query.push(`CREATE USER IF NOT EXISTS "${username}"@"${host}" IDENTIFIED BY "${password}" ${extra}`);
        query.push(`ALTER USER "${username}"@"${host}" IDENTIFIED WITH mysql_native_password BY "${password}"`);
        query.push(`GRANT ${privileges} ON *.* TO "${username}"@"${host}" WITH GRANT OPTION`);
      });

      query.push('SET SQL_LOG_BIN = ON');

      return `mysql -u ${root.username} -p -e '${query.join(';')}'`;
    },
    answers: (box, data, line) => {
      return line.match(/password:$/) ?
        root.password :
        null;
    }
  });

  const creator = new Commander({
    description: 'Create mysql databases',
    decide: () => {
      return create !== null;
    },
    command: (box, data) => {
      let creation = create;

      if (typeof creation === 'function') {
        creation = creation(box, data);
      }

      const query = [
        'SET SQL_LOG_BIN = OFF',
        'SET GLOBAL SUPER_READ_ONLY = OFF'
      ];

      creation.forEach(({ name }) => {
        query.push(`CREATE DATABASE IF NOT EXISTS ${name}`);
      });

      query.push('SET SQL_LOG_BIN = ON');

      return `mysql -u ${root.username} -p -e '${query.join(';')}'`;
    },
    answers: (box, data, line) => {
      return line.match(/password:$/) ?
        root.password :
        null;
    }
  });

  const migrator = new Commander({
    description: 'Migrate mysql',
    confirm: true,
    decide: () => {
      return migrate !== null;
    },
    command: (box, data) => {
      let migration = migrate;

      if (typeof migration === 'function') {
        migration = migration(box, data);
      }

      if (migration === null) {
        return '';
      }

      const commands = [];
      const files = resolveMigration(migration);
      let query = null;

      files.forEach(({ file, name }) => {
        query = [
          `USE ${name}`,
          file
        ];

        commands.push(
          `mysql -u ${root.username} -p -e '${query.join(';')}'`
        );
      });

      return commands;
    },
    answers: (box, data, line) => {
      return line.match(/password:$/) ?
        root.password :
        null;
    }
  });

  const replicator = new Commander({
    description: 'Replicate mysql',
    confirm: true,
    decide: () => {
      return replicate !== null;
    },
    command: (box, data) => {
      let replication = replicate;

      if (typeof replication === 'function') {
        replication = replication(box, data);
      }

      if (replication === null) {
        return '';
      }

      const commands = [];

      if (replication.bootstrap === false) {
        const rsync = [
          'rsync',
          '-Sa',
          `-e "ssh -q -i ${replication.rsync.key} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p ${replication.rsync.port}"`,
          `--port ${replication.rsync.port}`,
          '--exclude=*.pem',
          '--exclude=auto.cnf',
          `${replication.rsync.username}@${replication.rsync.host}:/var/lib/mysql/*`,
          '/var/lib/mysql'
        ].join(' ');

        commands.push(ctl('stop', 'mysql'));
        commands.push(rsync);
        commands.push(ctl('start', 'mysql'));
      }

      const query = [
        'SET SQL_LOG_BIN = OFF',
        'SET GLOBAL SUPER_READ_ONLY = OFF',
        `CHANGE MASTER TO MASTER_USER = "${replication.mysql.username}", MASTER_PASSWORD = "${replication.mysql.password}" FOR CHANNEL "group_replication_recovery"`,
        'SET SQL_LOG_BIN = ON'
      ];

      commands.push(
        `mysql -u ${root.username} -p -e '${query.join(';')}'`
      );

      return commands;
    },
    answers: (box, data, line) => {
      return line.match(/password:$/) ?
        root.password :
        null;
    }
  });

  const restarter = new Commander({
    description: 'Restart mysql',
    confirm: true,
    decide: (box) => {
      return restart === true && box.start === true;
    },
    command: () => {
      return ctl('restart', 'mysql');
    }
  });

  installer
    .connect(restrictor)
    .connect(securer)
    .connect(adder)
    .connect(creator)
    .connect(migrator)
    .connect(replicator)
    .connect(restarter);

  return [installer, restarter];
}
