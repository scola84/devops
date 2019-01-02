import { Commander } from '@scola/ssh';

export default function pm2() {
  const install = new Commander({
    description: 'Install pm2',
    command: 'npm install pm2 --global'
  });

  const startup = new Commander({
    description: 'Startup pm2',
    sudo: false,
    command: 'pm2 startup | bash'
  });

  const update = new Commander({
    description: 'Start pm2 apps',
    sudo: false,
    command: (box, data) => {
      const commands = [];

      data.role.pm2.app.forEach(({ args = '', name, options = [], path }) => {
        commands.push([
          `pm2 reload ${name}`,
          `pm2 start ${options.join(' ')} -n ${name} ${path} -- ${args}`
        ].join('||'));
      });

      return commands;
    }
  });

  const save = new Commander({
    description: 'Save pm2',
    sudo: false,
    command: 'pm2 save'
  });

  install
    .connect(startup)
    .connect(update)
    .connect(save);

  return [install, save];
}
