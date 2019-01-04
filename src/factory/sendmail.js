import { Commander, pkg } from '@scola/ssh';

export default function sendmail() {
  return new Commander({
    description: 'Install sendmail',
    command: [
      pkg('install', 'sendmail-bin sendmail')
    ]
  });
}
