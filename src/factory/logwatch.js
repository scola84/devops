import { Commander, pkg, sed } from '@scola/ssh';
import { Worker } from '@scola/worker';

export default function createLogwatch({
  install = false,
  update = null
}) {
  const beginner = new Worker();
  const ender = new Worker();

  const installer = new Commander({
    description: 'Install logwatch',
    command() {
      return pkg('install', 'logwatch');
    }
  });

  const updater = new Commander({
    description: 'Update logwatch',
    quiet: true,
    command(box, data) {
      const {
        from,
        to,
        settings
      } = this.resolve(update, box, data);

      let rules = [];

      if (from && to) {
        rules.push(['Output.*', 'Output = mail']);
        rules.push(['MailFrom.*', `MailFrom = ${from}`]);
        rules.push(['MailTo.*', `MailTo = ${to}`]);
      }

      if (settings) {
        rules = rules.concat(settings);
      }

      return sed('/usr/share/logwatch/default.conf/logwatch.conf',
        rules);
    }
  });

  beginner
    .connect(install === true ? installer : null)
    .connect(update !== null ? updater : null)
    .connect(ender);

  return [beginner, ender];
}
