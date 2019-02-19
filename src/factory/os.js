import { Commander, key, pkg } from '@scola/ssh';
import { Worker } from '@scola/worker';

export default function createOs({
  install = false,
  update = false,
  upgrade = null
}) {
  const beginner = new Worker();
  const ender = new Worker();

  const upgrader = new Commander({
    description: 'Upgrade apt',
    command(box, data) {
      const {
        key: keyId
      } = this.resolve(upgrade, box, data);

      const commands = [];

      if (key) {
        commands.push(key(keyId));
      }

      commands.push(pkg('update'));
      commands.push(pkg('upgrade'));
      commands.push(pkg('autoremove'));

      return commands;
    }
  });

  const installer = new Commander({
    description: 'Install apt packages',
    command() {
      return [
        pkg('install', 'unattended-upgrades'),
        pkg('install', 'build-essential')
      ];
    }
  });

  const updater = new Commander({
    description: 'Update ctl',
    command(box, data) {
      return [
        `hostnamectl set-hostname ${data.hostname}`,
        'timedatectl set-timezone UTC',
        'timedatectl set-ntp no'
      ];
    }
  });

  beginner
    .connect(upgrade !== null ? upgrader : null)
    .connect(install === true ? installer : null)
    .connect(update === true ? updater : null)
    .connect(ender);

  return [beginner, ender];
}
