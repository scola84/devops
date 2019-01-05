import { Commander, chmod, sed } from '@scola/ssh';

export default function createSwap(options = {
  update: false,
  create: null
}) {
  const creator = new Commander({
    description: 'Create swap file',
    decide: () => {
      return options.create !== null;
    },
    command: () => {
      return [
        'swapoff -a',
        `fallocate -l ${options.create.size} /swapfile`,
        'mkswap /swapfile',
        'swapon /swapfile'
      ];
    }
  });

  const updater = new Commander({
    description: 'Update swap file',
    quiet: true,
    decide: () => {
      return options.update === false;
    },
    command: [
      chmod('/swapfile', '0600'),
      sed('/etc/fstab', '\\/swapfile none swap ws 0 0')
    ]
  });

  creator
    .connect(updater);

  return [creator, updater];
}
