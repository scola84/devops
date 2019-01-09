import { Commander, sed } from '@scola/ssh';

export default function createUser({
  add = null,
  group = null,
  history = null,
  password = null,
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

  const grouper = new Commander({
    description: 'Add user to groups',
    decide: () => {
      return group !== null;
    },
    command: () => {
      return `usermod -aG ${group.name} ${group.username}`;
    }
  });

  const passwordUpdater = new Commander({
    description: 'Update user password',
    decide: () => {
      return password !== null;
    },
    command: () => {
      return `passwd ${password.username}`;
    },
    answers: (box, data, line) => {
      return line.match(/password:$/) ?
        password.password || 'tty' :
        null;
    }
  });

  const historyUpdater = new Commander({
    description: 'Update user history',
    sudo: false,
    decide: () => {
      return history !== null;
    },
    command: () => {
      const file = `/home/${history.username}/.bashrc`;

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
    .connect(adder)
    .connect(grouper)
    .connect(passwordUpdater)
    .connect(historyUpdater)
    .connect(remover);

  return [adder, remover];
}
