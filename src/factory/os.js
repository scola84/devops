import { Commander, pkg } from '@scola/ssh';

export default function createOs({
  install = false,
  update = false,
  upgrade = false
}) {
  const upgrader = new Commander({
    description: 'Upgrade apt',
    decide: () => {
      return upgrade === true;
    },
    command: () => {
      return [
        pkg('update'),
        pkg('upgrade'),
        pkg('autoremove')
      ];
    }
  });

  const installer = new Commander({
    description: 'Install apt packages',
    decide: () => {
      return install === true;
    },
    command: () => {
      return [
        pkg('install', 'unattended-upgrades'),
        pkg('install', 'build-essential')
      ];
    }
  });

  const updater = new Commander({
    description: 'Update ctl',
    decide: () => {
      return update === true;
    },
    command: (box, data) => {
      return [
        `hostnamectl set-hostname ${data.hostname}`,
        'timedatectl set-timezone UTC',
        'timedatectl set-ntp no'
      ];
    }
  });

  upgrader
    .connect(installer)
    .connect(updater);

  return [upgrader, updater];
}
