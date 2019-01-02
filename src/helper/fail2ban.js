import { Commander, ctl, pkg, sed } from '@scola/ssh';

export default function fail2ban() {
  const install = new Commander({
    description: 'Install fail2ban',
    command: [
      pkg('install', 'fail2ban')
    ]
  });

  const update = new Commander({
    description: 'Update fail2ban',
    quiet: true,
    command: (box, data) => {
      const service = data.role.fail2ban || {};

      let settings = [
        ['action = %(action_.*)s', 'action = %(action_mw)s'],
        ['bantime.*', 'bantime = 10m'],
        ['port.*', `port = ${data.ssh.port}`, 'sshd']
      ];

      const from = service.from || data.role.mta.from;
      const to = service.to || data.role.mta.to;

      if (from && to) {
        settings.push(['sender.*', `sender = ${from}`]);
        settings.push(['destemail.*', `destemail = ${to}`]);
      }

      if (service.settings) {
        settings = settings.concat(service.settings);
      }

      return sed('/etc/fail2ban/jail.conf', settings);
    }
  });

  const restart = new Commander({
    description: 'Restart fail2ban',
    command: [
      ctl('restart', 'fail2ban')
    ]
  });

  install
    .connect(update)
    .connect(restart);

  return [install, restart];
}
