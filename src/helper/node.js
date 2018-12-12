import { Commander, pkg } from '@scola/ssh';

export default function node() {
  return new Commander({
    description: 'Install node',
    command: (box, data) => {
      const service = data.role.node || {};

      return [
        `curl -sL https://deb.nodesource.com/setup_${service.version}.x | sudo -E bash -`,
        pkg('install', 'nodejs')
      ];
    }
  });
}
