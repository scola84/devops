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
      const file = `/home/${service.username}/.ssh/authorized_keys`;

      return [
        copy(service.key, file),
        chown(file, service.username, service.username),
        chmod(file, '0600')
      ];
    }
  });

  const harden = new Commander({
    description: 'Harden SSH',
    command: (box, data) => {
      const service = data.role.ssh;

      let settings = [
        ['#?Port.*', `Port ${service.port}`],
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
