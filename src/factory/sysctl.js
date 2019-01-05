import { Commander, sed } from '@scola/ssh';

export default function createSysctl(options = {
  update: false
}) {
  const updater = new Commander({
    description: 'Update sysctl',
    quiet: true,
    decide: () => {
      return options.update === true;
    },
    command: () => {
      return sed('/etc/sysctl.conf', [
        ['net.ipv4.conf.default.rp_filter=1'],
        ['net.ipv4.conf.all.rp_filter=1'],
        ['net.ipv4.tcp_syncookies=1'],
        ['net.ipv4.conf.all.accept_redirects = 0'],
        ['net.ipv4.conf.all.send_redirects = 0'],
        ['net.ipv4.conf.all.accept_source_route = 0'],
        ['net.ipv4.conf.all.log_martians = 1'],
      ]);
    }
  });

  return updater;
}
