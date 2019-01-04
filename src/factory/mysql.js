import { Commander, ctl, pkg } from '@scola/ssh';
import { migrate } from '../helper';

export default function mysql() {
  const installer = new Commander({
    description: 'Install mysql',
    command: () => {
      return pkg('install', 'mysql-server');
    }
  });

  const changer = new Commander({
    description: 'Change mysql root password',
    quiet: true,
    command: (box, data) => {
      const service = data.role.mysql || {};
      return `mysql -u ${service.root.username} -NBe 'ALTER USER "${service.root.username}"@"localhost" IDENTIFIED WITH mysql_native_password BY "${service.root.password}";'`;
    }
  });

  const securer = new Commander({
    description: 'Secure mysql',
    command: (box, data) => {
      const service = data.role.mysql || {};

      const query = [
        `DELETE FROM mysql.user WHERE User="${service.root.username}" AND Host NOT IN ("localhost", "127.0.0.1", "::1")`,
        'DELETE FROM mysql.user WHERE User=""',
        `CREATE USER IF NOT EXISTS "${service.user.username}"@"localhost" IDENTIFIED BY "${service.user.password}"`,
        `ALTER USER "${service.user.username}"@"localhost" IDENTIFIED WITH mysql_native_password BY "${service.user.password}"`,
        `GRANT ALL PRIVILEGES ON *.* TO "${service.user.username}"@"localhost" WITH GRANT OPTION`,
        'DROP DATABASE IF EXISTS test'
      ];

      return `mysql -u ${service.root.username} -p -e '${query.join(';')}'`;
    },
    answers: (box, data, line) => {
      return line.match(/password:$/) ?
        data.role.mysql.root.password :
        null;
    }
  });

  const creator = new Commander({
    description: 'Create mysql databases',
    command: (box, data) => {
      const service = data.role.mysql || {};

      const query = service.database.map(({ name }) => {
        return `CREATE DATABASE IF NOT EXISTS ${name}`;
      });

      return `mysql -u ${service.user.username} -p -e '${query.join(';')}'`;
    },
    answers: (box, data, line) => {
      return line.match(/password:$/) ?
        data.role.mysql.user.password :
        null;
    }
  });

  const migrator = new Commander({
    description: 'Execute mysql migration',
    command: (box, data) => {
      const service = data.role.mysql || {};
      const commands = [];

      const files = migrate(box, data, service.migration);

      files.forEach(({ file, name }) => {
        commands.push(
          `mysql -u ${data.role.mysql.user.username} -p -e 'USE ${name}; ${file}'`
        );
      });

      return commands;
    },
    answers: (box, data, line) => {
      return line.match(/password:$/) ?
        data.role.mysql.user.password :
        null;
    }
  });

  const restarter = new Commander({
    description: 'Restart mysql',
    command: ctl('restart', 'mysql')
  });

  installer
    .connect(changer)
    .connect(securer)
    .connect(creator)
    .connect(migrator)
    .connect(restarter);

  return [installer, restarter];
}
