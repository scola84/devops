import { Commander, sed } from '@scola/ssh';

export default function createUser({
  add = null,
  remove = null
}) {
  const adder = new Commander({
    description: 'Add user',
    decide: () => {
      return add !== null;
    },
    command: () => {
      return `adduser --gecos "" ${add.username}`;
    },
    answers: (box, data, line) => {
      return line.match(/password:$/) ?
        add.password || 'tty' :
        null;
    }
  });

  const adderSudo = new Commander({
    description: 'Add user to sudo',
    decide: () => {
      return add !== null;
    },
    command: () => {
      return `usermod -aG sudo ${add.username}`;
    }
  });

  const adderPassword = new Commander({
    description: 'Update password',
    decide: () => {
      return add !== null;
    },
    command: () => {
      return `passwd ${add.username}`;
    },
    answers: (box, data, line) => {
      return line.match(/password:$/) ?
        add.password || 'tty' :
        null;
    }
  });

  const adderHistory = new Commander({
    description: 'Update history',
    sudo: false,
    decide: () => {
      return add !== null;
    },
    command: () => {
      const file = `/home/${add.username}/.bashrc`;

      const disable = sed(file, [
        ['set +o history']
      ]);

      return [
        disable,
        '. ' + file,
        'history -c',
        'history -w'
      ];
    }
  });

  const remover = new Commander({
    description: 'Remove user',
    decide: () => {
      return remove !== null;
    },
    command: () => {
      return `userdel -rfRZ ${remove.username}`;
    }
  });

  adder
    .connect(adderSudo)
    .connect(adderPassword)
    .connect(adderHistory)
    .connect(remover);

  return [adder, remover];
}
