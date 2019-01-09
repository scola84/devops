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
      let commands = [
        pkg('install', 'mysql-server')
      ];

      if (install.version) {
        commands = [
          `curl -OL https://dev.mysql.com/get/mysql-apt-config_${install.version}.deb`,
          `DEBIAN_FRONTEND=noninteractive dpkg -i mysql-apt-config_${install.version}.deb`,
          pkg('update'),
          `rm mysql-apt-config_${install.version}.deb`
        ].concat(commands);
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
        `ALTER USER "${root.username}"@"localhost" IDENTIFIED WITH mysql_native_password BY "${root.password}"`
      ];

      query.unshift('SET SQL_LOG_BIN = OFF');
      query.push('SET SQL_LOG_BIN = ON');

      return `mysql -u ${root.username} -N -B -e '${query}'`;
    }
  });

  const securer = new Commander({
    description: 'Secure mysql',
    decide: () => {
      return secure === true;
    },
    command: () => {
      const query = [
        `DELETE FROM mysql.user WHERE User="${root.username}" AND Host NOT IN ("localhost", "127.0.0.1", "::1")`,
        'DELETE FROM mysql.user WHERE User=""',
        'DROP DATABASE IF EXISTS test'
      ];

      query.unshift('SET SQL_LOG_BIN = OFF');
      query.push('SET SQL_LOG_BIN = ON');

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
      const query = [];

      add.forEach(({ extra = '', host, username, password, privileges }) => {
        query.push(`CREATE USER IF NOT EXISTS "${username}"@"${host}" IDENTIFIED BY "${password}" ${extra}`);
        query.push(`ALTER USER "${username}"@"${host}" IDENTIFIED WITH mysql_native_password BY "${password}"`);
        query.push(`GRANT ${privileges} ON *.* TO "${username}"@"${host}" WITH GRANT OPTION`);
      });

      query.unshift('SET SQL_LOG_BIN = OFF');
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

      const query = creation.map(({ name }) => {
        return `CREATE DATABASE IF NOT EXISTS ${name}`;
      });

      query.unshift('SET SQL_LOG_BIN = OFF');
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
    decide: () => {
      return migrate !== null;
    },
    command: (box, data) => {
      let migration = migrate;

      if (typeof migration === 'function') {
        migration = migration(box, data);
      }

      if (migration === null) {
        return null;
      }

      const commands = [];
      const files = resolveMigration(migration);
      let query = null;

      files.forEach(({ file, name }) => {
        query = [
          'SET SQL_LOG_BIN = OFF',
          `USE ${name}`,
          file,
          'SET SQL_LOG_BIN = ON'
        ];

        commands.push(
          `mysql -u ${root.username} -p -e '${query.join(';')}`
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
    decide: () => {
      return replicate !== null;
    },
    command: (box, data) => {
      let replication = replicate;

      if (typeof replication === 'function') {
        replication = replication(box, data);
      }

      if (replication === null) {
        return null;
      }

      const query = [
        `CHANGE MASTER TO MASTER_USER = "${replication.username}", MASTER_PASSWORD = "${replication.password}" FOR CHANNEL "group_replication_recovery"`,
      ];

      if (replication.bootstrap) {
        query.push('SET GLOBAL group_replication_bootstrap_group = ON');
      }

      query.push('START GROUP_REPLICATION');

      if (replication.bootstrap) {
        query.push('SET GLOBAL group_replication_bootstrap_group = OFF');
      }

      return `mysql -u ${root.username} -p -e '${query.join(';')}'`;
    },
    answers: (box, data, line) => {
      return line.match(/password:$/) ?
        root.password :
        null;
    }
  });

  const restarter = new Commander({
    description: 'Restart mysql',
    decide: () => {
      return restart === true;
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
