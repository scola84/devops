import { Commander, ctl, pkg, sed } from '@scola/ssh';
import { Worker } from '@scola/worker';

export default function createFail2ban({
  install = false,
  restart = false,
  update = null
}) {
  const beginner = new Worker();
  const ender = new Worker();

  const installer = new Commander({
    description: 'Install fail2ban',
    command() {
      return [
        pkg('install', 'fail2ban')
      ];
    }
  });

  const updater = new Commander({
    description: 'Update fail2ban',
    quiet: true,
    command(box, data) {
      const {
        from,
        port,
        to,
        settings
      } = this.resolve(update, box, data);

      let rules = [];

      if (port) {
        rules.push(['port.*', `port = ${port}`, 'sshd']);
      }

      if (from && to) {
        rules.push(['action = %\\(action_.*\\)s', 'action = %(action_mw)s']);
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
    decide(box) {
      return box.start === true;
    },
    command() {
      return [
        ctl('restart', 'fail2ban')
      ];
    }
  });

  beginner
    .connect(install === true ? installer : null)
    .connect(update !== null ? updater : null)
    .connect(restart === true ? restarter : null)
    .connect(ender);

  return [beginner, ender];
}
