import { Commander, ctl, pkg } from '@scola/ssh';
import { Worker } from '@scola/worker';

export default function createNtp({
  install = false,
  restart = false
}) {
  const beginner = new Worker();
  const ender = new Worker();

  const installer = new Commander({
    description: 'Install NTP',
    command() {
      return pkg('install', 'ntp');
    }
  });

  const restarter = new Commander({
    description: 'Restart NTP',
    confirm: true,
    decide(box) {
      return box.start === true;
    },
    command() {
      return ctl('restart', 'ntp');
    }
  });

  beginner
    .connect(install === true ? installer : null)
    .connect(restart === true ? restarter : null)
    .connect(ender);

  return [beginner, ender];
}
