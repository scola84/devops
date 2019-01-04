import { Commander, pkg } from '@scola/ssh';

export default function node() {
  return new Commander({
    description: 'Install node',
    quiet: true,
    command: (box, data) => {
      const service = data.role.node || {};

      return [
        `curl -sL https://deb.nodesource.com/setup_${service.version}.x | sudo bash`,
        pkg('install', 'nodejs')
      ];
    }
  });
}
