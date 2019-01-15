import { Commander, pkg } from '@scola/ssh';
import { Worker } from '@scola/worker';

export default function createOs({
  install = false,
  update = false,
  upgrade = false
}) {
  const beginner = new Worker();
  const ender = new Worker();

  const upgrader = new Commander({
    description: 'Upgrade apt',
    command() {
      return [
        pkg('update'),
        pkg('upgrade'),
        pkg('autoremove')
      ];
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
    .connect(upgrade === true ? upgrader : null)
    .connect(install === true ? installer : null)
    .connect(update === true ? updater : null)
    .connect(ender);

  return [beginner, ender];
}
