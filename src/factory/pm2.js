import { Commander } from '@scola/ssh';

export default function createPm2({
  install = false,
  save = false,
  startup = false,
  start = null
}) {
  const installer = new Commander({
    description: 'Install pm2',
    decide: () => {
      return install === true;
    },
    command: () => {
      return 'npm install pm2 --global';
    }
  });

  const startupper = new Commander({
    description: 'Startup pm2',
    sudo: false,
    decide: () => {
      return startup === true;
    },
    command: () => {
      return 'pm2 startup | tail -n 1 | bash';
    }
  });

  const starter = new Commander({
    description: 'Start pm2 apps',
    sudo: false,
    decide: (box) => {
      return start !== null && box.start === true;
    },
    command: () => {
      const commands = [];

      start.forEach(({ args = '', name, opts = [], path }) => {
        commands.push([
          `pm2 reload ${name}`,
          `pm2 start ${opts.join(' ')} -n ${name} ${path} -- ${args}`
        ].join(' || '));
      });

      return commands;
    }
  });

  const saver = new Commander({
    description: 'Save pm2',
    sudo: false,
    decide: () => {
      return save === true;
    },
    command: () => {
      return 'pm2 save';
    }
  });

  installer
    .connect(startupper)
    .connect(starter)
    .connect(saver);

  return [installer, saver];
}
