import { Commander, ctl, pkg } from '@scola/ssh';

export default function createNginx({
  install = false,
  restart = false
}) {
  const installer = new Commander({
    description: 'Install nginx',
    decide: () => {
      return install === true;
    },
    command: () => {
      return pkg('install', 'nginx');
    }
  });

  const restarter = new Commander({
    description: 'Restart nginx',
    confirm: true,
    decide: (box) => {
      return restart === true && box.start === true;
    },
    command: () => {
      return ctl('restart', 'nginx');
    }
  });

  installer
    .connect(restarter);

  return [installer, restarter];
}
