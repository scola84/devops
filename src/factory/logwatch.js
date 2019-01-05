import { Commander, pkg, sed } from '@scola/ssh';

export default function createLogwatch(options = {
  install: false,
  update: null
}) {
  const installer = new Commander({
    description: 'Install logwatch',
    decide: () => {
      return options.install === true;
    },
    command: () => {
      return pkg('install', 'logwatch');
    }
  });

  const updater = new Commander({
    description: 'Update logwatch',
    quiet: true,
    decide: () => {
      return options.update !== null;
    },
    command: () => {
      const {
        from,
        to,
        settings
      } = options.update;

      let pattern = [];

      if (from && to) {
        pattern.push(['Output.*', 'Output = mail']);
        pattern.push(['MailFrom.*', `MailFrom = ${from}`]);
        pattern.push(['MailTo.*', `MailTo = ${to}`]);
      }

      if (settings) {
        pattern = pattern.concat(settings);
      }

      return sed('/usr/share/logwatch/default.conf/logwatch.conf', pattern);
    }
  });

  installer
    .connect(updater);

  return [installer, updater];
}
