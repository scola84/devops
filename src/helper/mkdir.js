import { Commander, chmod, chown } from '@scola/ssh';

export default function mkdir() {
  return new Commander({
    description: 'Make directories',
    command: (box, data) => {
      const service = data.role.mkdir || {};
      const commands = [];

      let own = null;
      let mod = null;

      service.dir.forEach((dir) => {
        commands.push(`mkdir -p ${dir.path}`);

        own = dir.chown;

        if (typeof own === 'function') {
          own = own(box, data);
        }

        mod = dir.chmod;

        if (typeof mod === 'function') {
          mod = mod(box, data);
        }

        if (own) {
          commands.push(chown(dir.path, own));
        }

        if (mod) {
          commands.push(chmod(dir.path, mod));
        }
      });

      return commands;
    }
  });
}
