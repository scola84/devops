import { Commander, ctl, sed } from '@scola/ssh';
import { Worker } from '@scola/worker';

export default function createSysctl({
  update = false,
  execute = null
}) {
  const beginner = new Worker();
  const ender = new Worker();

  const executer = new Commander({
    description: 'Execute sysctl',
    command(box, data) {
      const commands = [];
      const items = this.resolve(execute, box, data);

      items.forEach(({ action, name }) => {
        commands.push(ctl(action, name));
      });

      return commands;
    }
  });

  const updater = new Commander({
    description: 'Update sysctl',
    quiet: true,
    command() {
      return sed('/etc/sysctl.conf', [
        ['net.ipv4.conf.default.rp_filter=1'],
        ['net.ipv4.conf.all.rp_filter=1'],
        ['net.ipv4.tcp_syncookies=1'],
        ['net.ipv4.conf.all.accept_redirects = 0'],
        ['net.ipv4.conf.all.send_redirects = 0'],
        ['net.ipv4.conf.all.accept_source_route = 0'],
        ['net.ipv4.conf.all.log_martians = 1'],
      ], {
        escape: true
      });
    }
  });

  beginner
    .connect(update === true ? updater : null)
    .connect(execute !== null ? executer : null)
    .connect(ender);

  return [beginner, ender];
}
