import { Commander, chmod, chown } from '@scola/ssh';

export default function createMkdir(options = {
  create: null
}) {
  const creator = new Commander({
    description: 'Create directories',
    decide: () => {
      return options.create !== null;
    },
    command: (box, data) => {
      const commands = [];

      options.create.forEach((mod, own, path) => {
        commands.push(`mkdir -p ${path}`);

        if (typeof own === 'function') {
          own = own(box, data);
        }

        if (typeof mod === 'function') {
          mod = mod(box, data);
        }

        if (own) {
          commands.push(chown(path, own));
        }

        if (mod) {
          commands.push(chmod(path, mod));
        }
      });

      return commands;
    }
  });

  return creator;
}
