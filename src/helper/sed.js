import { Commander, sed } from '@scola/ssh';

export default function sed1() {
  return new Commander({
    description: 'Edit files',
    command: (box, data) => {
      const service = data.role.sed || {};
      const commands = [];

      service.file.forEach((file) => {
        let pattern = file.pattern;

        if (typeof pattern === 'function') {
          pattern = pattern(box, data);
        }

        let replacer = file.replacer;

        if (typeof replacer === 'function') {
          replacer = replacer(box, data);
        }

        let section = file.section;

        if (typeof section === 'function') {
          section = section(box, data);
        }

        commands.push(sed(file.file, pattern, replacer, section));
      });

      return commands;
    }
  });
}
