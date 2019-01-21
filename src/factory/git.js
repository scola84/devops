import { Commander, pkg } from '@scola/ssh';
import { Worker } from '@scola/worker';

export default function createGit({
  install = false,
  checkout = null,
  clone = null
}) {
  const beginner = new Worker();
  const ender = new Worker();

  const installer = new Commander({
    description: 'Install git',
    command() {
      return pkg('install', 'git');
    }
  });

  const cloner = new Commander({
    description: 'Clone git repositories',
    sudo: false,
    command(box, data) {
      const commands = [];
      const items = this.resolve(clone, box, data);

      items.forEach(({ path, uri }) => {
        commands.push(`mkdir -p ${path}`);
        commands.push(`git clone -q ${uri} ${path}`);
      });

      return commands;
    },
    answers(box, data, line) {
      if (line.match(/yes\/no/)) {
        return 'yes';
      }

      return null;
    }
  });

  const checkouter = new Commander({
    description: 'Checkout git repositories',
    sudo: false,
    command(box, data) {
      const commands = [];
      const items = this.resolve(checkout, box, data);

      items.forEach(({ path, name }) => {
        commands.push(`cd ${path}`);
        commands.push('git fetch');
        commands.push('git checkout .');
        commands.push(`git checkout ${name}`);
        commands.push('cd ~');
      });

      return commands;
    }
  });

  beginner
    .connect(install === true ? installer : null)
    .connect(clone !== null ? cloner : null)
    .connect(checkout !== null ? checkouter : null)
    .connect(ender);

  return [beginner, ender];
}
