import XRegExp from 'xregexp';
import { readFileSync, readdirSync } from 'fs';
import createFilter from './create-filter';

export default function collectDirectories(box) {
  if (box.directory && box.directory[0] === '@') {
    return collectFromFile(box.directory);
  }

  if (box.recursive === true) {
    return collectFromDir(box.directory);
  }

  return [process.cwd()];
}

function collectFromFile(directory) {
  const splitter = new XRegExp('(?<!\\\\)@');
  const [, file, filter = '.*'] = directory.split(splitter);

  const data = String(readFileSync(file));
  let list = data.trim().split('\n\n');

  list = list.filter((item) => {
    item = item.split('\n').slice(1).join('\n');
    return item.match(new XRegExp(filter)) !== null;
  });

  list = list.map((item) => {
    item = item.match('(.+)\\$');
    return item && item[1];
  });

  return list;
}

function collectFromDir(directory) {
  const cwd = process.cwd();
  const regexp = createFilter(directory);

  return readdirSync(cwd).filter((item) => {
    return item.match(regexp) !== null;
  }).map((item) => {
    return cwd + '/' + item;
  });
}
