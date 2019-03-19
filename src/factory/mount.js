import { Commander, chmod, chown, pkg, sed } from '@scola/ssh';
import { Worker } from '@scola/worker';

export default function createMount({
  create = false,
  execute = false,
  install = false,
  update = null
}) {
  const beginner = new Worker();
  const ender = new Worker();

  const installer = new Commander({
    description: 'Install mount',
    command(box, data) {
      const items = this.resolve(update, box, data);
      return items.length > 0 ? pkg('install', 'sshfs') : null;
    }
  });

  const creator = new Commander({
    description: 'Create mount',
    command(box, data) {
      const commands = [];
      const items = this.resolve(update, box, data);

      items.forEach(({ mod, own, target }) => {
        commands.push(`mkdir -p ${target}`);

        if (mod) {
          commands.push(chmod(target, mod));
        }

        if (own) {
          commands.push(chown(target, own));
        }
      });

      return commands;
    }
  });

  const updater = new Commander({
    description: 'Update mount',
    quiet: true,
    command(box, data) {
      const rules = [];
      const items = this.resolve(update, box, data);

      items.forEach(({ dump, fsck, opts, source, target, type }) => {
        rules.push(
          [
            `${source} ${target} ${type} ${opts} ${dump} ${fsck}`
          ]
        );
      });

      return sed('/etc/fstab', rules, { escape: true });
    }
  });

  const executer = new Commander({
    description: 'Execute mount',
    command(box, data) {
      const items = this.resolve(update, box, data);
      return items.length > 0 ? 'mount -a' : null;
    }
  });

  beginner
    .connect(install === true ? installer : null)
    .connect(create === true ? creator : null)
    .connect(update !== null ? updater : null)
    .connect(execute !== null ? executer : null)
    .connect(ender);

  return [beginner, ender];
}
