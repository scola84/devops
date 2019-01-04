import { Commander, chmod, chown, copy } from '@scola/ssh';

export default function copy1() {
  return new Commander({
    description: 'Copy files',
    command: (box, data) => {
      const service = data.role.copy || {};
      const commands = [];

      let own = null;
      let mod = null;

      service.file.forEach((file) => {
        const options = typeof file.options === 'function' ?
          file.options(box, data) : file.options;

        commands.push(copy(file.source, file.target, options));

        own = file.chown;

        if (typeof own === 'function') {
          own = own(box, data);
        }

        mod = file.chmod;

        if (typeof mod === 'function') {
          mod = mod(box, data);
        }

        if (own) {
          commands.push(chown(file.target, own));
        }

        if (mod) {
          commands.push(chmod(file.target, mod));
        }
      });

      return commands;
    }
  });
}
