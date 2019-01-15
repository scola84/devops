import { Commander } from '@scola/ssh';
import { Worker } from '@scola/worker';

export default function createNpm({
  execute = null,
  login = null
}) {
  const beginner = new Worker();
  const ender = new Worker();

  const logger = new Commander({
    description: 'Login to npm',
    sudo: false,
    command() {
      return 'npm login';
    },
    answers(box, data, line) {
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
    command(box, data) {
      const commands = [];
      const items = this.resolve(execute, box, data);

      items.forEach(({ name, path, script = '' }) => {
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

  beginner
    .connect(login !== null ? logger : null)
    .connect(execute !== null ? executer : null)
    .connect(ender);

  return [beginner, ender];
}
