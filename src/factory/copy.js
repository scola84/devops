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
        if (typeof mod === 'function') {
          mod = mod(box, data);
        }

        if (typeof opts === 'function') {
          opts = opts(box, data);
        }

        if (typeof own === 'function') {
          own = own(box, data);
        }

        if (typeof source === 'function') {
          source = source(box, data);
        }

        if (typeof target === 'function') {
          target = target(box, data);
        }

        if (source === null || target === null || opts === null) {
          return;
        }

        source = source[0] === '/' ?
          source : base + '/' + source;

        commands.push(cp(source, target, opts));

        if (mod) {
          commands.push(chmod(target, mod));
        }

        if (own) {
          commands.push(chown(target, own));
        }
      });

      return commands;
    }
  });
}
