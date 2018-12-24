import { Commander, sed } from '@scola/ssh';

export default function sed1() {
  return new Commander({
    description: 'Edit files',
    command: (box, data) => {
      const service = data.role.sed || {};
      const commands = [];

      service.file.forEach((file) => {
        commands.push(sed(file.file, file.pattern,
          file.replacer, file.section));
      });

      return commands;
    }
  });
}
