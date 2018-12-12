import { Commander, chmod, chown, copy, ctl, sed } from '@scola/ssh';

export default function ssh() {
  const prepare = new Commander({
    description: 'Prepare SSH dir',
    decide: (box, data) => {
      return data.role.user.install.key !== '';
    },
    command: (box, data) => {
      const service = data.role.user.install;
      const dir = `/home/${service.username}/.ssh`;

      return [
        `mkdir ${dir}`,
        chown(dir, service.username, service.username),
        chmod(dir, '0700')
      ];
    }
  });

  const install = new Commander({
    description: 'Install SSH key',
    decide: (box, data) => {
      return data.role.user.install.key !== '';
    },
    command: (box, data) => {
      const service = data.role.user.install;
      const commands = [];

      const id = `/home/${service.username}/.ssh/id_rsa`;
      const keys = `/home/${service.username}/.ssh/authorized_keys`;

      if (service.private !== false) {
        commands.push(copy(service.key, id));
        commands.push(chown(id, service.username, service.username));
        commands.push(chmod(id, '0600'));
      }

      if (service.public !== false) {
        commands.push(copy(service.key + '.pub', keys));
        commands.push(chown(keys, service.username, service.username));
        commands.push(chmod(keys, '0600'));
      }

      return commands;
    }
  });

  const harden = new Commander({
    description: 'Harden SSH',
    command: (box, data) => {
      const service = data.role.ssh || {};

      let settings = [
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

      if (service.settings) {
        settings = settings.concat(service.settings);
      }

      return sed('/etc/ssh/sshd_config', settings);
    }
  });

  const restart = new Commander({
    description: 'Restart SSH',
    command: ctl('restart', 'sshd')
  });

  prepare
    .connect(install)
    .connect(harden)
    .connect(restart);

  return [prepare, restart];
}
