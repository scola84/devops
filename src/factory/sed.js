import { Commander, sed } from '@scola/ssh';

export default function createSed(options = {
  edit: null
}) {
  const editor = new Commander({
    description: 'Edit files',
    quiet: true,
    decide: () => {
      return options.edit !== null;
    },
    command: (box, data) => {
      const commands = [];

      options.edit.forEach(({ file, pattern, replacer, section }) => {
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
