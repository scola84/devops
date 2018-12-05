import { Commander, pkg, ufw } from '@scola/ssh';

export default function ufw1() {
  const install = new Commander({
    description: 'Install UFW',
    command: pkg('install', 'ufw')
  });

  const update = new Commander({
    description: 'Allow UFW SSH',
    quiet: true,
    command: (box, data) => {
      const commands = [
        'ufw default deny incoming',
      ];

      data.services.ufw.services.forEach((service) => {
        service = data.services[service];

        commands.push(ufw(
          service.port,
          service.act,
          service.dir,
          service.on,
          service.proto,
          service.from,
          service.to
        ));
      });

      return commands;
    }
  });

  const enable = new Commander({
    description: 'Enable UFW',
    command: 'ufw enable',
    answers: () => 'y'
  });

  install
    .connect(update)
    .connect(enable);

  return [install, enable];
}
