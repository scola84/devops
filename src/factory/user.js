import { Commander, sed } from '@scola/ssh';
import { Worker } from '@scola/worker';

export default function createUser({
  add = null,
  group = null,
  history = null,
  password = null,
  remove = null
}) {
  const beginner = new Worker();
  const ender = new Worker();

  const adder = new Commander({
    description: 'Add user',
    command() {
      return `adduser --gecos "" ${add.username}`;
    },
    answers(box, data, line) {
      return line.match(/password:$/) ?
        add.password || 'tty' :
        null;
    }
  });

  const grouper = new Commander({
    description: 'Add user to groups',
    command() {
      return `usermod -aG ${group.name} ${group.username}`;
    }
  });

  const passwordUpdater = new Commander({
    description: 'Update user password',
    command() {
      return `passwd ${password.username}`;
    },
    answers(box, data, line) {
      return line.match(/password:$/) ?
        password.password || 'tty' :
        null;
    }
  });

  const historyUpdater = new Commander({
    description: 'Update user history',
    sudo: false,
    command() {
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
    command() {
      return `userdel -rfRZ ${remove.username}`;
    }
  });

  beginner
    .connect(add !== null ? adder : null)
    .connect(group !== null ? grouper : null)
    .connect(password !== null ? passwordUpdater : null)
    .connect(history !== null ? historyUpdater : null)
    .connect(remove !== null ? remover : null)
    .connect(ender);

  return [beginner, ender];
}
