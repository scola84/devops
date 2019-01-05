import { Commander } from '@scola/ssh';

export default function createNpm(options = {
  execute: null,
  login: null
}) {
  const login = new Commander({
    description: 'Login to npm',
    sudo: false,
    decide: () => {
      return options.login !== null;
    },
    command: () => {
      return 'npm login';
    },
    answers: (box, data, line) => {
      if (line.match(/username/i)) {
        return options.login.username;
      }

      if (line.match(/password/i)) {
        return options.login.password;
      }

      if (line.match(/email: \(this is public\)/i)) {
        return options.login.email;
      }

      return null;
    }
  });

  const executer = new Commander({
    description: 'Execute npm commands',
    sudo: false,
    decide: () => {
      return options.execute !== null;
    },
    command: () => {
      const commands = [];

      options.execute.forEach(({ name, path, script = '' }) => {
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

  login
    .connect(executer);

  return [login, executer];
}
