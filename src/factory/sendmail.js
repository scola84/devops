import { Commander, pkg } from '@scola/ssh';

export default function createSendmail({
  install = false
}) {
  const installer = new Commander({
    description: 'Install sendmail',
    decide: () => {
      return install === true;
    },
    command: [
      pkg('install', 'sendmail-bin sendmail')
    ]
  });

  return installer;
}
