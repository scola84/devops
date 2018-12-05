import { Commander, chmod, sed } from '@scola/ssh';

export default function swap() {
  const create = new Commander({
    description: 'Create swap file',
    command: [
      'ls / | grep swapfile || sudo fallocate -l 1G /swapfile',
      'ls / | grep swapfile || mkswap /swapfile',
      'ls / | grep swapfile || swapon /swapfile'
    ]
  });

  const update = new Commander({
    description: 'Update swap file',
    command: [
      chmod('/swapfile', '0600'),
      sed('/etc/fstab', '/swapfile none swap ws 0 0')
    ]
  });

  create
    .connect(update);

  return [create, update];
}
