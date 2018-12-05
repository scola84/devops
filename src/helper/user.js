import { Commander } from '@scola/ssh';

export default function user() {
  const install = new Commander({
    description: 'Create user',
    decide: (box, data) => {
      return data.services.user.install.username !== '';
    },
    command: (box, data) => {
      return `adduser --gecos "" ${data.services.user.install.username}`;
    },
    answers: (box, data) => {
      return data.services.user.install.password || 'tty';
    }
  });

  const updateSudo = new Commander({
    description: 'Add user to sudo',
    decide: (box, data) => {
      return data.services.user.install.username !== '';
    },
    command: (box, data) => {
      return `usermod -aG sudo ${data.services.user.install.username}`;
    }
  });

  const updatePassword = new Commander({
    description: 'Update password',
    decide: (box, data) => {
      return data.services.user.install.username !== '';
    },
    command: (box, data) => {
      return `passwd ${data.services.user.install.username}`;
    },
    answers: (box, data) => {
      return data.services.user.install.password || 'tty';
    }
  });

  const remove = new Commander({
    description: 'Remove user',
    decide: (box, data) => {
      return data.services.user.remove.username !== '';
    },
    command: (box, data) => {
      return `userdel -rfRZ ${data.services.user.remove.username}`;
    }
  });

  install
    .connect(updateSudo)
    .connect(updatePassword)
    .connect(remove);

  return [install, remove];
}
