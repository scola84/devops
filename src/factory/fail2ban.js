import { Commander, ctl, pkg, sed } from '@scola/ssh';

export default function createFail2ban(options = {
  install: false,
  restart: false,
  update: null
}) {
  const installer = new Commander({
    description: 'Install fail2ban',
    decide: () => {
      return options.install === true;
    },
    command: [
      pkg('install', 'fail2ban')
    ]
  });

  const updater = new Commander({
    description: 'Update fail2ban',
    quiet: true,
    decide: () => {
      return options.update !== null;
    },
    command: (box, data) => {
      const {
        from,
        to,
        settings
      } = options.update;

      let pattern = [
        ['action = %(action_.*)s', 'action = %(action_mw)s'],
        ['bantime.*', 'bantime = 10m'],
        ['port.*', `port = ${data.ssh.port}`, 'sshd']
      ];

      if (from && to) {
        pattern.push(['sender.*', `sender = ${from}`]);
        pattern.push(['destemail.*', `destemail = ${to}`]);
      }

      if (settings) {
        pattern = pattern.concat(settings);
      }

      return sed('/etc/fail2ban/jail.conf', pattern);
    }
  });

  const restarter = new Commander({
    description: 'Restart fail2ban',
    decide: () => {
      return options.restart === true;
    },
    command: [
      ctl('restart', 'fail2ban')
    ]
  });

  installer
    .connect(updater)
    .connect(restarter);

  return [installer, restarter];
}
