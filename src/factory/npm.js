import { Commander } from '@scola/ssh';

export default function createNpm({
  execute = null,
  login = null
}) {
  const logger = new Commander({
    description: 'Login to npm',
    sudo: false,
    decide: () => {
      return login !== null;
    },
    command: () => {
      return 'npm login';
    },
    answers: (box, data, line) => {
      if (line.match(/username/i)) {
        return login.username;
      }

      if (line.match(/password/i)) {
        return login.password;
      }

      if (line.match(/email: \(this is public\)/i)) {
        return login.email;
      }

      return null;
    }
  });

  const executer = new Commander({
    description: 'Execute npm commands',
    sudo: false,
    decide: () => {
      return execute !== null;
    },
    command: () => {
      const commands = [];

      execute.forEach(({ name, path, script = '' }) => {
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
    }
  });

  logger
    .connect(executer);

  return [logger, executer];
}
