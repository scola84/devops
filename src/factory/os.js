import { Commander, pkg } from '@scola/ssh';

export default function os() {
  const upgradeApt = new Commander({
    description: 'Upgrade OS',
    command: [
      pkg('update'),
      pkg('upgrade'),
      pkg('autoremove'),
      pkg('install', 'build-essential')
    ]
  });

  const setHostname = new Commander({
    description: 'Set hostname',
    command: (box, data) => {
      return `hostnamectl set-hostname ${data.hostname}`;
    }
  });

  const setTimezone = new Commander({
    description: 'Set timezone',
    command: [
      'timedatectl set-timezone UTC',
      'timedatectl set-ntp no'
    ]
  });

  upgradeApt
    .connect(setHostname)
    .connect(setTimezone);

  return [upgradeApt, setTimezone];
}
