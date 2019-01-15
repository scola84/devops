import { Commander, pkg } from '@scola/ssh';

export default function createSendmail({
  install = false
}) {
  const installer = new Commander({
    description: 'Install sendmail',
    command() {
      return [
        pkg('install', 'sendmail-bin sendmail')
      ];
    }
  });

  return install === true ? installer : null;
}
