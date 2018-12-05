import { Commander, sed } from '@scola/ssh';

export default function sysctl() {
  return new Commander({
    description: 'Update sysctl',
    command: sed('/etc/sysctl.conf', [
      ['net.ipv4.conf.default.rp_filter=1'],
      ['net.ipv4.conf.all.rp_filter=1'],
      ['net.ipv4.tcp_syncookies=1'],
      ['net.ipv4.conf.all.accept_redirects = 0'],
      ['net.ipv4.conf.all.send_redirects = 0'],
      ['net.ipv4.conf.all.accept_source_route = 0'],
      ['net.ipv4.conf.all.log_martians = 1'],
    ])
  });
}
