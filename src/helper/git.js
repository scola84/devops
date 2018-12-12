import { Commander, pkg } from '@scola/ssh';

export default function git() {
  const install = new Commander({
    description: 'Install git',
    command: (box, data) => {
      const service = data.role.git || {};

      return [
        pkg('install', 'git', service.version)
      ];
    }
  });

  const clone = new Commander({
    description: 'Clone git repositories',
    sudo: false,
    command: (box, data) => {
      const service = data.role.git || {};
      const commands = [];

      service.repository.forEach((repository) => {
        commands.push(`mkdir -p ${repository.path}`);
        commands.push(`git clone -q ${repository.uri} ${repository.path}`);
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

  const update = new Commander({
    description: 'Update git repositories',
    sudo: false,
    command: (box, data) => {
      const service = data.role.git || {};
      const commands = [];

      service.repository.forEach((repository) => {
        if (repository.checkout) {
          commands.push(`cd ${repository.path}`);
          commands.push(`git checkout ${repository.checkout}`);
          commands.push('git pull');
          commands.push('cd ~');
        }
      });

      return commands;
    }
  });

  install
    .connect(clone)
    .connect(update);

  return [install, update];
}
