import { readdirSync, readFileSync } from 'fs';

export default function migrate(box, data, migration) {
  const files = [];

  let {
    from,
    to
  } = migration.version;

  if (typeof from === 'function') {
    from = from(box, data);
  }

  if (typeof to === 'function') {
    to = to(box, data);
  }

  const direction = to > from ?
    'up' :
    (to < from ? 'down' : '');

  migration.dir.forEach(({ dir, name }) => {
    let dirs = null;

    try {
      dirs = readdirSync(dir);
    } catch (error) {
      dirs = [];
    }

    dirs.sort().forEach((version) => {
      let base = '';
      let postfix = '';

      if (direction === 'up') {
        if (version > from && version <= to) {
          postfix = 'up';
        }
      } else if (direction === 'down') {
        if (version <= from && version > to) {
          postfix = 'down';
        }
      }

      if (postfix) {
        base = dir + '/' + version + '/' + postfix;

        readdirSync(base).forEach((file) => {
          files.push({
            direction,
            file: String(readFileSync(base + '/' + file)),
            name,
            version
          });
        });
      }
    });
  });

  return files;
}
