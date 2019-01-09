import { Commander, pkg, sed } from '@scola/ssh';

export default function createLogwatch({
  install = false,
  update = null
}) {
  const installer = new Commander({
    description: 'Install logwatch',
    decide: () => {
      return install === true;
    },
    command: () => {
      return pkg('install', 'logwatch');
    }
  });

  const updater = new Commander({
    description: 'Update logwatch',
    quiet: true,
    decide: () => {
      return update !== null;
    },
    command: () => {
      const {
        from,
        to,
        settings
      } = update;

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

  installer
    .connect(updater);

  return [installer, updater];
}
