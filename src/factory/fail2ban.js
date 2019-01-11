import { Commander, ctl, pkg, sed } from '@scola/ssh';

export default function createFail2ban({
  install = false,
  restart = false,
  update = null
}) {
  const installer = new Commander({
    description: 'Install fail2ban',
    decide: () => {
      return install === true;
    },
    command: [
      pkg('install', 'fail2ban')
    ]
  });

  const updater = new Commander({
    description: 'Update fail2ban',
    quiet: true,
    decide: () => {
      return update !== null;
    },
    command: () => {
      const {
        from,
        port,
        to,
        settings
      } = update;

      let rules = [
        ['action = %(action_.*)s', 'action = %(action_mw)s'],
        ['bantime.*', 'bantime = 10m'],
        ['port.*', `port = ${port}`, 'sshd']
      ];

      if (from && to) {
        rules.push(['sender.*', `sender = ${from}`]);
        rules.push(['destemail.*', `destemail = ${to}`]);
      }

      if (settings) {
        rules = rules.concat(settings);
      }

      return sed('/etc/fail2ban/jail.conf', rules);
    }
  });

  const restarter = new Commander({
    description: 'Restart fail2ban',
    confirm: true,
    decide: (box) => {
      return restart === true && box.start === true;
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
