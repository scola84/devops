import { Commander, pkg } from '@scola/ssh';

export default function createNode({
  install = null
}) {
  const installer = new Commander({
    description: 'Install node',
    quiet: true,
    decide: () => {
      return install !== null;
    },
    command: () => {
      const uri = `https://deb.nodesource.com/setup_${install.version}.x`;

      return [
        `curl -sL ${uri} | sudo bash`,
        pkg('install', 'nodejs')
      ];
    }
  });

  return installer;
}
