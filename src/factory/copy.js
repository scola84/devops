import { Commander, chmod, chown, cp } from '@scola/ssh';

export default function createCopy({
  base = '',
  copy = null
}) {
  const copier = new Commander({
    description: 'Copy files',
    command(box, data) {
      const commands = [];
      const items = this.resolve(copy, box, data);

      items.forEach(({ mod, opts, own, source, target }) => {
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

  return copy !== null ? copier : null;
}
