import { Commander, sed } from '@scola/ssh';

export default function createUser(options = {
  add: null,
  remove: null
}) {
  const adder = new Commander({
    description: 'Add user',
    decide: () => {
      return options.add !== null;
    },
    command: () => {
      return `adduser --gecos "" ${options.add.username}`;
    },
    answers: (box, data, line) => {
      return line.match(/password:$/) ?
        options.add.password || 'tty' :
        null;
    }
  });

  const adderSudo = new Commander({
    description: 'Add user to sudo',
    decide: () => {
      return options.add !== null;
    },
    command: () => {
      return `usermod -aG sudo ${options.add.username}`;
    }
  });

  const adderPassword = new Commander({
    description: 'Update password',
    decide: () => {
      return options.add !== null;
    },
    command: () => {
      return `passwd ${options.add.username}`;
    },
    answers: (box, data, line) => {
      return line.match(/password:$/) ?
        options.add.password || 'tty' :
        null;
    }
  });

  const adderHistory = new Commander({
    description: 'Update history',
    sudo: false,
    decide: () => {
      return options.add !== null;
    },
    command: () => {
      const file = `/home/${options.add.username}/.bashrc`;

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
      return options.remove !== null;
    },
    command: () => {
      return `userdel -rfRZ ${options.remove.username}`;
    }
  });

  adder
    .connect(adderSudo)
    .connect(adderPassword)
    .connect(adderHistory)
    .connect(remover);

  return [adder, remover];
}
