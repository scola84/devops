import { Commander } from '@scola/ssh';

export default function npm() {
  return new Commander({
    description: 'Run npm',
    sudo: false,
    command: (box, data) => {
      const service = data.role.npm || {};
      const commands = [];

      service.command.forEach(({ name, path, script = '' }) => {
        if (path) {
          commands.push(`cd ${path}`);
        }

        let command = `npm ${name} ${script}`;

        command = script.match(/--global/) ?
          'sudo ' + command : command;

        commands.push(command);

        if (path) {
          commands.push('cd ~');
        }
      });

      return commands;
    },
    answers: (box, data, line, command) => {
      if (command !== 'npm login') {
        return null;
      }

      const service = data.role.npm || {};

      if (line.match(/username/i)) {
        return service.login.username;
      }

      if (line.match(/password/i)) {
        return service.login.password;
      }

      if (line.match(/email: \(this is public\)/i)) {
        return service.login.email;
      }

      return null;
    }
  });
}
