import { Commander, sed } from '@scola/ssh';

export default function createSed({
  edit = null
}) {
  const editor = new Commander({
    description: 'Edit files',
    quiet: true,
    decide: () => {
      return edit !== null;
    },
    command: (box, data) => {
      const commands = [];

      edit.forEach(({ file, pattern, replacer, section }) => {
        if (typeof file === 'function') {
          file = file(box, data);
        }

        if (typeof pattern === 'function') {
          pattern = pattern(box, data);
        }

        if (typeof replacer === 'function') {
          replacer = replacer(box, data);
        }

        if (typeof section === 'function') {
          section = section(box, data);
        }

        commands.push(sed(file, pattern, replacer, section));
      });

      return commands;
    }
  });

  return editor;
}
