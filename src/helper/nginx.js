import { Commander, ctl, pkg } from '@scola/ssh';

export default function nginx() {
  const install = new Commander({
    description: 'Install nginx',
    command: (box, data) => {
      const service = data.role.nginx || {};
      return pkg('install', 'nginx', service.version);
    }
  });

  const restart = new Commander({
    description: 'Restart nginx',
    command: ctl('restart', 'nginx')
  });

  install
    .connect(restart);

  return [install, restart];
}
