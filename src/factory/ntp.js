import { Commander, ctl, pkg } from '@scola/ssh';

export default function ntp() {
  const install = new Commander({
    description: 'Install NTP',
    command: [
      pkg('install', 'ntp')
    ]
  });

  const restart = new Commander({
    description: 'Restart NTP',
    command: [
      ctl('restart', 'ntp')
    ]
  });

  install
    .connect(restart);

  return [install, restart];
}
