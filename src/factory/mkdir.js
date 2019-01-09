import { Commander, chmod, chown } from '@scola/ssh';

export default function createMkdir({
  create = null
}) {
  const creator = new Commander({
    description: 'Create directories',
    decide: () => {
      return create !== null;
    },
    command: (box, data) => {
      const commands = [];

      create.forEach(({ mod, own, path }) => {

        if (typeof mod === 'function') {
          mod = mod(box, data);
        }

        if (typeof own === 'function') {
          own = own(box, data);
        }

        if (typeof path === 'function') {
          path = path(box, data);
        }

        commands.push(`mkdir -p ${path}`);

        if (mod) {
          commands.push(chmod(path, mod));
        }

        if (own) {
          commands.push(chown(path, own));
        }
      });

      return commands;
    }
  });

  return creator;
}
