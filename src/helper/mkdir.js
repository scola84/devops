import { Commander, chmod, chown } from '@scola/ssh';

export default function mkdir() {
  return new Commander({
    description: 'Make directories',
    command: (box, data) => {
      const service = data.role.mkdir || {};
      const commands = [];

      const user = data.ssh.user.username;

      service.dir.forEach((dir) => {
        commands.push(`mkdir -p ${dir.path}`);
        commands.push(chown(dir.path, user, user));
        commands.push(chmod(dir.path, dir.chmod));
      });

      return commands;
    }
  });
}
