import { Commander } from '@scola/ssh';
import { Worker } from '@scola/worker';

export default function createPm2({
  install = false,
  rotate = false,
  save = false,
  startup = false,
  update = false,
  start = null
}) {
  const beginner = new Worker();
  const ender = new Worker();

  const installer = new Commander({
    description: 'Install pm2',
    command() {
      return 'npm install pm2@latest --global';
    }
  });

  const updater = new Commander({
    description: 'Update pm2',
    sudo: false,
    command() {
      return 'pm2 update';
    }
  });

  const startupper = new Commander({
    description: 'Startup pm2',
    sudo: false,
    command() {
      return 'pm2 startup | tail -n 1 | bash';
    }
  });

  const starter = new Commander({
    description: 'Start pm2 apps',
    confirm: true,
    sudo: false,
    decide(box) {
      return box.start === true;
    },
    command(box, data) {
      const commands = [];
      const items = this.resolve(start, box, data);

      items.forEach(({ args = '', name, node = '', opts = [], path }) => {
        args = args ? `-- ${args}` : '';
        node = node ? `--node-args="${node}"` : '';

        commands.push([
          `pm2 reload ${name}`,
          `pm2 start ${opts.join(' ')} -n ${name} ${path} ${node} ${args}`
        ].join(' || '));
      });

      return commands;
    }
  });

  const saver = new Commander({
    description: 'Save pm2',
    sudo: false,
    command() {
      return 'pm2 save';
    }
  });

  beginner
    .connect(install === true ? installer : null)
    .connect(update === true ? updater : null)
    .connect(startup === true ? startupper : null)
    .connect(start !== null ? starter : null)
    .connect(save === true ? saver : null)
    .connect(ender);

  return [beginner, ender];
}
