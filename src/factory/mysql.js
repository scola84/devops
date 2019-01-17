import { Commander, ctl, pkg } from '@scola/ssh';
import { Worker } from '@scola/worker';
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
  const beginner = new Worker();
  const ender = new Worker();

  const installer = new Commander({
    description: 'Install mysql',
    command(box, data) {
      const {
        server,
        router
      } = this.resolve(install, box, data);

      const commands = [];

      if (server) {
        if (typeof server === 'string') {
          commands.push(`curl -OL https://dev.mysql.com/get/mysql-apt-config_${server}.deb`);
          commands.push(`DEBIAN_FRONTEND=noninteractive dpkg -i mysql-apt-config_${server}.deb`);
          commands.push(pkg('update'));
          commands.push(`rm mysql-apt-config_${server}.deb`);
        }

        commands.push(pkg('install', 'mysql-server'));
      }

      if (router) {
        commands.push(pkg('install', 'mysql-router'));
      }

      return commands;
    }
  });

  const restrictor = new Commander({
    description: 'Restrict mysql root access',
    quiet: true,
    command() {
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
    command() {
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
    answers(box, data, line) {
      return line.match(/password:$/) ?
        root.password :
        null;
    }
  });

  const adder = new Commander({
    description: 'Add mysql user',
    command(box, data) {
      const items = this.resolve(add, box, data);

      const query = [
        'SET SQL_LOG_BIN = OFF',
        'SET GLOBAL SUPER_READ_ONLY = OFF'
      ];

      items.forEach(({ extra = '', host, username, password, privileges }) => {
        query.push(`CREATE USER IF NOT EXISTS "${username}"@"${host}" IDENTIFIED BY "${password}" ${extra}`);
        query.push(`ALTER USER "${username}"@"${host}" IDENTIFIED WITH mysql_native_password BY "${password}"`);
        query.push(`GRANT ${privileges} ON *.* TO "${username}"@"${host}" WITH GRANT OPTION`);
      });

      query.push('SET SQL_LOG_BIN = ON');

      return `mysql -u ${root.username} -p -e '${query.join(';')}'`;
    },
    answers(box, data, line) {
      return line.match(/password:$/) ?
        root.password :
        null;
    }
  });

  const creator = new Commander({
    description: 'Create mysql databases',
    command(box, data) {
      const items = this.resolve(create, box, data);

      const query = [
        'SET SQL_LOG_BIN = OFF',
        'SET GLOBAL SUPER_READ_ONLY = OFF'
      ];

      items.forEach(({ name }) => {
        query.push(`CREATE DATABASE IF NOT EXISTS ${name}`);
      });

      query.push('SET SQL_LOG_BIN = ON');

      return `mysql -u ${root.username} -p -e '${query.join(';')}'`;
    },
    answers(box, data, line) {
      return line.match(/password:$/) ?
        root.password :
        null;
    }
  });

  const migrator = new Commander({
    description: 'Migrate mysql',
    confirm: true,
    command(box, data) {
      const migration = this.resolve(migrate, box, data);

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
    answers(box, data, line) {
      return line.match(/password:$/) ?
        root.password :
        null;
    }
  });

  const replicator = new Commander({
    description: 'Replicate mysql',
    confirm: true,
    command(box, data) {
      const replication = this.resolve(replicate, box, data);

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
    answers(box, data, line) {
      return line.match(/password:$/) ?
        root.password :
        null;
    }
  });

  const restarter = new Commander({
    description: 'Restart mysql',
    confirm: true,
    decide(box) {
      return box.start === true;
    },
    command() {
      return ctl('restart', 'mysql');
    }
  });

  beginner
    .connect(install !== null ? installer : null)
    .connect(restrict === true ? restrictor : null)
    .connect(secure === true ? securer : null)
    .connect(add !== null ? adder : null)
    .connect(create !== null ? creator : null)
    .connect(migrate !== null ? migrator : null)
    .connect(replicate !== null ? replicator : null)
    .connect(restart === true ? restarter : null)
    .connect(ender);

  return [beginner, ender];
}
