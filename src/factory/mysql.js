import { Commander, ctl, pkg } from '@scola/ssh';
import { resolveMigration } from '../helper';

export default function createMysql(options = {
  install: false,
  restart: false,
  restrict: false,
  secure: false,
  create: null,
  migrate: null,
  root: {},
  user: {}
}) {
  const installer = new Commander({
    description: 'Install mysql',
    decide: () => {
      return options.install === true;
    },
    command: () => {
      return pkg('install', 'mysql-server');
    }
  });

  const restrictor = new Commander({
    description: 'Restrict mysql root access',
    quiet: true,
    decide: () => {
      return options.restrict === true;
    },
    command: () => {
      const { root } = options;
      const query = `ALTER USER "${root.username}"@"localhost" IDENTIFIED WITH mysql_native_password BY "${root.password}";`;
      return `mysql -u ${root.username} -N -B -e '${query}'`;
    }
  });

  const securer = new Commander({
    description: 'Secure mysql',
    decide: () => {
      return options.secure === true;
    },
    command: () => {
      const {
        root,
        user
      } = options;

      const query = [
        `DELETE FROM mysql.user WHERE User="${root.username}" AND Host NOT IN ("localhost", "127.0.0.1", "::1")`,
        'DELETE FROM mysql.user WHERE User=""',
        `CREATE USER IF NOT EXISTS "${user.username}"@"localhost" IDENTIFIED BY "${user.password}"`,
        `ALTER USER "${user.username}"@"localhost" IDENTIFIED WITH mysql_native_password BY "${user.password}"`,
        `GRANT ALL PRIVILEGES ON *.* TO "${user.username}"@"localhost" WITH GRANT OPTION`,
        'DROP DATABASE IF EXISTS test'
      ];

      return `mysql -u ${root.username} -p -e '${query.join(';')}'`;
    },
    answers: (box, data, line) => {
      return line.match(/password:$/) ?
        options.root.password :
        null;
    }
  });

  const creator = new Commander({
    description: 'Create mysql databases',
    decide: () => {
      return options.create !== null;
    },
    command: (box, data) => {
      let create = options.create;

      if (typeof create === 'function') {
        create = create(box, data);
      }

      const query = create.map(({ name }) => {
        return `CREATE DATABASE IF NOT EXISTS ${name}`;
      });

      return `mysql -u ${options.user.username} -p -e '${query.join(';')}'`;
    },
    answers: (box, data, line) => {
      return line.match(/password:$/) ?
        options.user.password :
        null;
    }
  });

  const migrator = new Commander({
    description: 'Migrate mysql',
    decide: () => {
      return options.migrate !== null;
    },
    command: (box, data) => {
      let migrate = options.migrate;

      if (typeof migrate === 'function') {
        migrate = migrate(box, data);
      }

      const commands = [];
      const files = resolveMigration(migrate);

      files.forEach(({ file, name }) => {
        commands.push(
          `mysql -u ${options.user.username} -p -e 'USE ${name}; ${file}'`
        );
      });

      return commands;
    },
    answers: (box, data, line) => {
      return line.match(/password:$/) ?
        options.user.password :
        null;
    }
  });

  const restarter = new Commander({
    description: 'Restart mysql',
    decide: () => {
      return options.restart === true;
    },
    command: () => {
      return ctl('restart', 'mysql');
    }
  });

  installer
    .connect(restrictor)
    .connect(securer)
    .connect(creator)
    .connect(migrator)
    .connect(restarter);

  return [installer, restarter];
}
