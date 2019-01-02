import { Commander, pkg, sed } from '@scola/ssh';

export default function logwatch() {
  const install = new Commander({
    description: 'Install logwatch',
    command: pkg('install', 'logwatch')
  });

  const update = new Commander({
    description: 'Update logwatch',
    quiet: true,
    command: (box, data) => {
      const service = data.role.logwatch = {};

      let settings = [];

      const from = service.from || data.role.mta.from;
      const to = service.to || data.role.mta.to;

      if (from && to) {
        settings.push(['Output.*', 'Output = mail']);
        settings.push(['MailFrom.*', `MailFrom = ${from}`]);
        settings.push(['MailTo.*', `MailTo = ${to}`]);
      }

      if (service.settings) {
        settings = settings.concat(service.settings);
      }

      return sed('/usr/share/logwatch/default.conf/logwatch.conf', settings);
    }
  });

  install
    .connect(update);

  return [install, update];
}
