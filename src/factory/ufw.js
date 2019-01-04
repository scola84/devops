import { Commander, pkg, ufw } from '@scola/ssh';

export default function ufw1() {
  const install = new Commander({
    description: 'Install UFW',
    command: pkg('install', 'ufw')
  });

  const update = new Commander({
    description: 'Update UFW rules',
    quiet: true,
    command: (box, data) => {
      const commands = [
        'ufw default deny incoming',
      ];

      data.role.ufw.rule.forEach((rule) => {
        commands.push(ufw(rule));
      });

      return commands;
    }
  });

  const enable = new Commander({
    description: 'Enable UFW',
    command: 'ufw --force enable'
  });

  install
    .connect(update)
    .connect(enable);

  return [install, enable];
}
