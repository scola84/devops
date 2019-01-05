import { Commander, pkg } from '@scola/ssh';

export default function createNode(options = {
  install: null
}) {
  const installer = new Commander({
    description: 'Install node',
    quiet: true,
    decide: () => {
      return options.install !== null;
    },
    command: () => {
      const version = options.install.version;
      const uri = `https://deb.nodesource.com/setup_${version}.x`;

      return [
        `curl -sL ${uri} | sudo bash`,
        pkg('install', 'nodejs')
      ];
    }
  });

  return installer;
}
