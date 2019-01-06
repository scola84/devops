import { Commander, pkg, ufw } from '@scola/ssh';

export default function createUfw({
  enable = false,
  install = false,
  update = null
}) {
  const installer = new Commander({
    description: 'Install ufw',
    decide: () => {
      return install === true;
    },
    command: () => {
      return pkg('install', 'ufw');
    }
  });

  const updater = new Commander({
    description: 'Update ufw rules',
    quiet: true,
    decide: () => {
      return update !== null;
    },
    command: () => {
      const commands = [
        'ufw default deny incoming',
      ];

      update.forEach((rule) => {
        commands.push(ufw(rule));
      });

      return commands;
    }
  });

  const enabler = new Commander({
    description: 'Enable ufw',
    decide: () => {
      return enable === true;
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
