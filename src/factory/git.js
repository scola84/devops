import { Commander, pkg } from '@scola/ssh';

export default function createGit(options = {
  install: false,
  checkout: null,
  clone: null
}) {
  const installer = new Commander({
    description: 'Install git',
    decide: () => {
      return options.install === true;
    },
    command: () => {
      return pkg('install', 'git');
    }
  });

  const cloner = new Commander({
    description: 'Clone git repositories',
    decide: () => {
      return options.clone !== null;
    },
    sudo: false,
    command: () => {
      const commands = [];

      options.clone.forEach(({ path, uri }) => {
        commands.push(`mkdir -p ${path}`);
        commands.push(`git clone -q ${uri} ${path}`);
      });

      return commands;
    },
    answers: (box, data, line) => {
      if (line.match(/yes\/no/)) {
        return 'yes';
      }

      return null;
    }
  });

  const checkouter = new Commander({
    description: 'Checkout git repositories',
    sudo: false,
    decide: () => {
      return options.checkout !== null;
    },
    command: () => {
      const commands = [];

      options.checkout.forEach(({ path, name }) => {
        commands.push(`cd ${path}`);
        commands.push('git fetch');
        commands.push(`git checkout ${name}`);
        commands.push('cd ~');
      });

      return commands;
    }
  });

  installer
    .connect(cloner)
    .connect(checkouter);

  return [installer, checkouter];
}
