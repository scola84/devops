import { Commander, chmod, chown, copy } from '@scola/ssh';

export default function createCopy(options = {
  copy: null
}) {
  return new Commander({
    description: 'Copy files',
    decide: () => {
      return options.copy !== null;
    },
    command: (box, data) => {
      const commands = [];

      options.copy.forEach(({ mod, opts, own, source, target }) => {
        if (typeof opts === 'function') {
          opts = opts(box, data);
        }

        commands.push(copy(source, target, opts));

        if (typeof own === 'function') {
          own = own(box, data);
        }

        if (typeof mod === 'function') {
          mod = mod(box, data);
        }

        if (own) {
          commands.push(chown(target, own));
        }

        if (mod) {
          commands.push(chmod(target, mod));
        }
      });

      return commands;
    }
  });
}
