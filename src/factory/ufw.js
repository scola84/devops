import { Commander, pkg, ufw } from '@scola/ssh';
import { Worker } from '@scola/worker';

export default function createUfw({
  enable = false,
  install = false,
  update = null
}) {
  const beginner = new Worker();
  const ender = new Worker();

  const installer = new Commander({
    description: 'Install ufw',
    command() {
      return pkg('install', 'ufw');
    }
  });

  const updater = new Commander({
    description: 'Update ufw rules',
    quiet: true,
    command(box, data) {
      const items = this.resolve(update, box, data);

      const commands = [
        'ufw default deny incoming',
      ];

      items.forEach((rule) => {
        commands.push(ufw(rule));
      });

      return commands;
    }
  });

  const enabler = new Commander({
    description: 'Enable ufw',
    command() {
      return 'ufw --force enable';
    }
  });

  beginner
    .connect(install === true ? installer : null)
    .connect(update !== null ? updater : null)
    .connect(enable === true ? enabler : null)
    .connect(ender);

  return [beginner, ender];
}
