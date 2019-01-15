import { Commander, pkg } from '@scola/ssh';

export default function createNode({
  install = null
}) {
  const installer = new Commander({
    description: 'Install node',
    quiet: true,
    command(box, data) {
      const { version } = this.resolve(install, box, data);
      const uri = `https://deb.nodesource.com/setup_${version}.x`;

      return [
        `curl -sL ${uri} | sudo bash`,
        pkg('install', 'nodejs')
      ];
    }
  });

  return install !== null ? installer : null;
}
