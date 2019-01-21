import { readdirSync, readFileSync } from 'fs';

export default function resolveVersion(options) {
  const files = [];

  const {
    from = '',
      to = ''
  } = options.version;

  let direction = 'equal';

  if (to > from) {
    direction = 'up';
  } else if (to < from) {
    direction = 'down';
  }

  options.dir.forEach(({ dir, name }) => {
    let dirs = null;

    try {
      dirs = readdirSync(dir);
    } catch (error) {
      dirs = [];
    }

    dirs.sort().forEach((version) => {
      let base = '';
      let list = [];
      let postfix = '';

      if (direction === 'up') {
        if (version > from && version <= to) {
          postfix = direction;
        }
      } else if (direction === 'down') {
        if (version <= from && version > to) {
          postfix = direction;
        }
      } else if (direction === 'equal') {
        if (version === to) {
          postfix = direction;
        }
      }

      if (postfix) {
        base = dir + '/' + version + '/' + postfix;

        try {
          list = readdirSync(base);
        } catch (e) {
          list = [];
        }

        list.forEach((file) => {
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
