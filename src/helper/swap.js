import { Commander, chmod, sed } from '@scola/ssh';

export default function swap() {
  const create = new Commander({
    description: 'Create swap file',
    command: (box, data) => {
      const service = data.role.swap || {};
      const size = service.size;

      return [
        'swapoff -a',
        `fallocate -l ${size} /swapfile`,
        'mkswap /swapfile',
        'swapon /swapfile'
      ];
    }
  });

  const update = new Commander({
    description: 'Update swap file',
    command: [
      chmod('/swapfile', '0600'),
      sed('/etc/fstab', '\\/swapfile none swap ws 0 0')
    ]
  });

  create
    .connect(update);

  return [create, update];
}
