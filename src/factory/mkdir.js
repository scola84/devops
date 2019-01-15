import { Commander, chmod, chown } from '@scola/ssh';

export default function createMkdir({
  create = null
}) {
  const creator = new Commander({
    description: 'Create directories',
    command(box, data) {
      const commands = [];
      const items = this.resolve(create, box, data);

      items.forEach(({ mod, own, path }) => {
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

  return create !== null ? creator : null;
}
