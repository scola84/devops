import { Commander, sed } from '@scola/ssh';

export default function createSed({
  edit = null
}) {
  const editor = new Commander({
    description: 'Edit files',
    quiet: true,
    command(box, data) {
      const commands = [];
      const items = this.resolve(edit, box, data);

      items.forEach(({ file, pattern, replacer, section }) => {
        commands.push(sed(file, pattern, replacer, section));
      });

      return commands;
    }
  });

  return edit !== null ? editor : null;
}
