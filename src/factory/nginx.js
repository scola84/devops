import { Commander, ctl, pkg } from '@scola/ssh';
import { Worker } from '@scola/worker';

export default function createNginx({
  install = false,
  restart = false
}) {
  const beginner = new Worker();
  const ender = new Worker();

  const installer = new Commander({
    description: 'Install nginx',
    command() {
      return pkg('install', 'nginx');
    }
  });

  const restarter = new Commander({
    description: 'Restart nginx',
    confirm: true,
    decide(box) {
      return box.start === true;
    },
    command() {
      return ctl('restart', 'nginx');
    }
  });

  beginner
    .connect(install === true ? installer : null)
    .connect(restart === true ? restarter : null)
    .connect(ender);

  return [beginner, ender];
}
