import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import trim from 'lodash-es/trim';
import recursive from 'recursive-readdir';

const skip = [
  '..',
  '.',
  'child_process',
  'cluster',
  'crypto',
  'fs',
  'http',
  'net',
  'os',
  'process',
  'readline',
  'stream',
  'tls',
  'url',
  'util'
];

export default function installDependencies(dir, reset, callback) {
  recursive(process.cwd() + dir, (error, files) => {
    if (error) {
      callback(error.code === 'ENOENT' ? null : error);
      return;
    }

    try {
      install(files, reset);
      callback();
    } catch (installError) {
      callback(installError);
    }
  });
}

function install(files, reset) {
  const modules = new Set();
  const self = process.cwd().split('/').slice(-2).join('/');

  files.forEach((file) => {
    const data = readFileSync(file);
    const match = String(data).match(/^import ([^;]|\n)*;$/mg) || [];
    let module = null;
    let scope = null;

    for (let i = 0; i < match.length; i += 1) {
      module = trim(match[i].slice(match[i].indexOf('\'')), ' \';');

      [scope, module] = module.split('/');

      module = module && scope.slice(0, 1) === '@' ?
        ([scope, module].join('/')) : scope;

      if (skip.indexOf(module) === -1) {
        if (module !== self) {
          modules.add(module);
        }
      }
    }
  });

  const data = readFileSync(process.cwd() + '/package.json');
  const json = JSON.parse(String(data));

  if (reset === true) {
    delete json.dependencies;
  }

  writeFileSync(process.cwd() + '/package.json', JSON.stringify(json));

  const options = { cwd: process.cwd(), stdio: 'inherit' };
  const names = Array.from(modules).sort().join(' ');

  execSync(`npm install ${names}`, options);
  execSync('rm -rf node_modules', options);
  execSync('rm package-lock.json', options);
}
