import { Commander, rm } from '@scola/ssh';

export default function createRm({
  base = '',
  remove = null
}) {
  const remover = new Commander({
    description: 'Remove files',
    command(box, data) {
      const commands = [];
      const items = this.resolve(remove, box, data);

      items.forEach(({ path }) => {
        if (path === null) {
          return;
        }

        path = path[0] === '/' ?
          path : base + '/' + path;

        commands.push(rm(path));
      });

      return commands;
    }
  });

  return remove !== null ? remover : null;
}
