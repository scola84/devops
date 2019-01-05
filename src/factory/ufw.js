import { Commander, pkg, ufw } from '@scola/ssh';

export default function createUfw(options = {
  enable: false,
  install: false,
  update: null
}) {
  const installer = new Commander({
    description: 'Install UFW',
    decide: () => {
      return options.install === true;
    },
    command: () => {
      return pkg('install', 'ufw');
    }
  });

  const updater = new Commander({
    description: 'Update UFW rules',
    quiet: true,
    decide: () => {
      return options.update !== null;
    },
    command: () => {
      const commands = [
        'ufw default deny incoming',
      ];

      options.update.forEach((rule) => {
        commands.push(ufw(rule));
      });

      return commands;
    }
  });

  const enabler = new Commander({
    description: 'Enable UFW',
    decide: () => {
      return options.enable === true;
    },
    command: () => {
      return 'ufw --force enable';
    }
  });

  installer
    .connect(updater)
    .connect(enabler);

  return [installer, enabler];
}
