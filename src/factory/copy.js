import { Commander, chmod, chown, cp } from '@scola/ssh';

export default function createCopy({
  base = '',
  copy = null
}) {
  return new Commander({
    description: 'Copy files',
    decide: () => {
      return copy !== null;
    },
    command: (box, data) => {
      const commands = [];

      copy.forEach(({ mod, opts, own, source, target }) => {
        if (typeof opts === 'function') {
          opts = opts(box, data);
        }

        commands.push(cp(base + '/' + source, target, opts));

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
