import { Commander } from '@scola/ssh';

export default function createPm2(options = {
  install: false,
  save: false,
  startup: false,
  reload: null,
  start: null
}) {
  const installer = new Commander({
    description: 'Install pm2',
    decide: () => {
      return options.install === true;
    },
    command: () => {
      return 'npm install pm2 --global';
    }
  });

  const startupper = new Commander({
    description: 'Startup pm2',
    sudo: false,
    decide: () => {
      return options.startup === true;
    },
    command: () => {
      return 'pm2 startup | tail -n 1 | bash';
    }
  });

  const starter = new Commander({
    description: 'Start pm2 apps',
    sudo: false,
    decide: () => {
      return options.start !== null;
    },
    command: () => {
      const commands = [];

      options.start.forEach(({ args = '', name, opts = [], path }) => {
        commands.push(
          `pm2 start ${opts.join(' ')} -n ${name} ${path} -- ${args}`
        );
      });

      return commands;
    }
  });

  const reloader = new Commander({
    description: 'Reload pm2 apps',
    sudo: false,
    decide: () => {
      return options.reload !== null;
    },
    command: () => {
      const commands = [];

      options.reload.forEach(({ name }) => {
        commands.push(`pm2 reload ${name}`);
      });

      return commands;
    }
  });

  const saver = new Commander({
    description: 'Save pm2',
    sudo: false,
    decide: () => {
      return options.save === true;
    },
    command: () => {
      return 'pm2 save';
    }
  });

  installer
    .connect(startupper)
    .connect(starter)
    .connect(reloader)
    .connect(saver);

  return [installer, saver];
}
