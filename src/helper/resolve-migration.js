import { readdirSync, readFileSync } from 'fs';

export default function resolveMigration(migrate) {
  const files = [];

  const {
    from,
    to
  } = migrate.version;

  const direction = to > from ?
    'up' :
    (to < from ? 'down' : '');

  migrate.dir.forEach(({ dir, name }) => {
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
