import { Commander, ctl, pkg } from '@scola/ssh';

export default function createNtp({
  install = false,
  restart = false
}) {
  const installer = new Commander({
    description: 'Install NTP',
    decide: () => {
      return install === true;
    },
    command: () => {
      return pkg('install', 'ntp');
    }
  });

  const restarter = new Commander({
    description: 'Restart NTP',
    decide: () => {
      return restart === true;
    },
    command: () => {
      return ctl('restart', 'ntp');
    }
  });

  installer
    .connect(restarter);

  return [installer, restarter];
}
