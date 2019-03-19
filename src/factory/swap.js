import { Commander, chmod, sed } from '@scola/ssh';
import { Worker } from '@scola/worker';

export default function createSwap({
  update = false,
  create = null
}) {
  const beginner = new Worker();
  const ender = new Worker();

  const creator = new Commander({
    description: 'Create swap file',
    command(box, data) {
      const { size } = this.resolve(create, box, data);

      return [
        'swapoff -a',
        `fallocate -l ${size} /swapfile`,
        'mkswap /swapfile',
        'swapon /swapfile'
      ];
    }
  });

  const updater = new Commander({
    description: 'Update swap file',
    quiet: true,
    command() {
      return [
        chmod('/swapfile', '0600'),
        sed('/etc/fstab', [
          ['/swapfile none swap ws 0 0']
        ])
      ];
    }
  });

  beginner
    .connect(create !== null ? creator : null)
    .connect(update === true ? updater : null)
    .connect(ender);

  return [beginner, ender];
}
