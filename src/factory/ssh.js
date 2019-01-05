import { Commander, chmod, chown, copy, ctl, sed } from '@scola/ssh';

export default function createSsh(options = {
  restart: false,
  harden: null,
  add: null
}) {
  const adder = new Commander({
    description: 'Add SSH key',
    decide: () => {
      return options.add !== null;
    },
    command: () => {
      const {
        key,
        prv,
        pub,
        username
      } = options.add;

      const dir = `/home/${username}/.ssh`;

      const commands = [
        `mkdir ${dir}`,
        chown(dir, username + ':' + username),
        chmod(dir, '0700')
      ];

      if (prv !== false) {
        const id = dir + '/id_rsa';
        commands.push(copy(key, id));
        commands.push(chown(id, username + ':' + username));
        commands.push(chmod(id, '0600'));
      }

      if (pub !== false) {
        const keys = dir + 'authorized_keys';
        commands.push(copy(key + '.pub', keys));
        commands.push(chown(keys, username + ':' + username));
        commands.push(chmod(keys, '0600'));
      }

      return commands;
    }
  });

  const hardener = new Commander({
    description: 'Harden SSH',
    quiet: true,
    decide: () => {
      return options.harden !== null;
    },
    command: (box, data) => {
      const {
        settings
      } = options.harden;

      let pattern = [
        ['#?Port.*', `Port ${data.ssh.port}`],
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

      if (settings) {
        pattern = pattern.concat(settings);
      }

      return sed('/etc/ssh/sshd_config', pattern);
    }
  });

  const restarter = new Commander({
    description: 'Restart SSH',
    decide: () => {
      return options.restart === true;
    },
    command: () => {
      return ctl('restart', 'sshd');
    }
  });

  adder
    .connect(hardener)
    .connect(restarter);

  return [adder, restarter];
}
