import { Commander, ctl, pkg } from '@scola/ssh';

export default function nginx() {
  const install = new Commander({
    description: 'Install nginx',
    command: [
      pkg('install', 'nginx')
    ]
  });

  const restart = new Commander({
    description: 'Restart nginx',
    command: ctl('restart', 'nginx')
  });

  install
    .connect(restart);

  return [install, restart];
}
