import { Commander, ctl, pkg } from '@scola/ssh';

export default function createNginx(options = {
  install: false,
  restart: false
}) {
  const installer = new Commander({
    description: 'Install nginx',
    decide: () => {
      return options.install === true;
    },
    command: () => {
      return pkg('install', 'nginx');
    }
  });

  const restarter = new Commander({
    description: 'Restart nginx',
    decide: () => {
      return options.restart === true;
    },
    command: () => {
      return ctl('restart', 'nginx');
    }
  });

  installer
    .connect(restarter);

  return [installer, restarter];
}
