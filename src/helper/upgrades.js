import { Commander, chmod, chown, copy, pkg } from '@scola/ssh';

export default function unattendedUpgrades() {
  const install = new Commander({
    description: 'Install unattended-upgrades',
    command: pkg('install', 'unattended-upgrades')
  });

  const update = new Commander({
    description: 'Update unattended-upgrades',
    command: (box, data) => {
      return [
        copy(data.role.upgrades['10periodic'],
          '/etc/apt/apt.conf.d/10periodic'),
        chmod('/etc/apt/apt.conf.d/10periodic', '0644'),
        chown('/etc/apt/apt.conf.d/10periodic', 'root', 'root')
      ];
    }
  });

  install
    .connect(update);

  return [install, update];
}
