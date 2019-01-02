import { Commander, pkg } from '@scola/ssh';

export default function mysql() {
  const install = new Commander({
    description: 'Install mysql',
    command: () => {
      return pkg('install', 'mysql-server');
    }
  });

  const change = new Commander({
    description: 'Change mysql root password',
    quiet: true,
    command: (box) => {
      return `mysql -u root -NBe 'ALTER USER "root"@"localhost" IDENTIFIED WITH mysql_native_password BY "${box.vars.MYSQL_ROOT_PASSWORD}";'`;
    }
  });

  const secure = new Commander({
    description: 'Secure mysql',
    command: (box) => {
      return [
        'mysql -u root -p -e \'DELETE FROM mysql.user WHERE User="root" AND Host NOT IN ("localhost", "127.0.0.1", "::1");\'',
        'mysql -u root -p -e \'DELETE FROM mysql.user WHERE User="";\'',
        `mysql -u root -p -e 'CREATE USER IF NOT EXISTS "${box.vars.MYSQL_USERNAME}"@"localhost" IDENTIFIED BY "${box.vars.MYSQL_PASSWORD}";'`,
        `mysql -u root -p -e 'ALTER USER "${box.vars.MYSQL_USERNAME}"@"localhost" IDENTIFIED WITH mysql_native_password BY "${box.vars.MYSQL_PASSWORD}";'`,
        `mysql -u root -p -e 'GRANT ALL PRIVILEGES ON *.* TO "${box.vars.MYSQL_USERNAME}"@"localhost" WITH GRANT OPTION;'`,
        'mysql -u root -p -e \'DROP DATABASE IF EXISTS test;\''
      ];
    },
    answers: (box) => {
      return box.vars.MYSQL_ROOT_PASSWORD;
    }
  });

  install
    .connect(change)
    .connect(secure);

  return [install, secure];
}
