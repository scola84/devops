import { Commander, chmod, chown, cp, ctl, sed } from '@scola/ssh';
import { Worker } from '@scola/worker';

export default function createSsh({
  restart = false,
  harden = null,
  add = null
}) {
  const beginner = new Worker();
  const ender = new Worker();

  const adder = new Commander({
    description: 'Add SSH key',
    command(box, data) {
      const {
        key,
        prv,
        pub,
        username
      } = this.resolve(add, box, data);

      const dir = `/home/${username}/.ssh`;

      const commands = [
        `ls ${dir} || mkdir ${dir}`,
        chown(dir, username + ':' + username),
        chmod(dir, '0700')
      ];

      if (prv !== false) {
        const id = dir + '/id_rsa';
        commands.push(cp(key, id));
        commands.push(chown(id, username + ':' + username));
        commands.push(chmod(id, '0600'));
      }

      if (pub !== false) {
        const keys = dir + '/authorized_keys';
        commands.push(cp(key + '.pub', keys));
        commands.push(chown(keys, username + ':' + username));
        commands.push(chmod(keys, '0600'));
      }

      return commands;
    }
  });

  const hardener = new Commander({
    description: 'Harden SSH',
    quiet: true,
    command(box, data) {
      const {
        port,
        settings
      } = this.resolve(harden, box, data);

      let rules = [
        ['#?PermitRootLogin.*', 'PermitRootLogin no'],
        ['#?PasswordAuthentication.*', 'PasswordAuthentication no'],
        ['#?IgnoreRhosts.*', 'IgnoreRhosts yes'],
        ['#?HostbasedAuthentication.*', 'HostbasedAuthentication no'],
        ['#?PermitEmptyPasswords.*', 'PermitEmptyPasswords no'],
        ['#?X11Forwarding.*', 'X11Forwarding no'],
        ['#?MaxAuthTries.*', 'MaxAuthTries 5'],
        ['#?Ciphers.*', 'Ciphers aes128-ctr,aes192-ctr,aes256-ctr'],
        ['#?UsePAM.*', 'UsePAM yes'],
        ['#?ClientAliveInterval.*', 'ClientAliveInterval 900'],
        ['#?ClientAliveCountMax.*', 'ClientAliveCountMax 0']
      ];

      if (port) {
        rules.push(['#?Port.*', `Port ${port}`]);
      }

      if (settings) {
        rules = rules.concat(settings);
      }

      return sed('/etc/ssh/sshd_config', rules);
    }
  });

  const restarter = new Commander({
    description: 'Restart SSH',
    confirm: true,
    decide(box) {
      return box.start === true;
    },
    command() {
      return ctl('restart', 'sshd');
    }
  });

  beginner
    .connect(add !== null ? adder : null)
    .connect(harden !== null ? hardener : null)
    .connect(restart === true ? restarter : null)
    .connect(ender);

  return [beginner, ender];
}
