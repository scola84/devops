import each from 'async/each';
import { exec } from 'child_process';
import { readFile, writeFile } from 'fs';
import trim from 'lodash-es/trim';
import recursive from 'recursive-readdir';

const skip = [
  '..',
  '.',
  'child_process',
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

export default function installDependencies(callback) {
  recursive(process.cwd() + '/src', (error, files) => {
    if (error) {
      return callback(error);
    }

    const modules = new Set();
    const self = process.cwd().split('/').slice(-2).join('/');

    return each(files, (file, eachCallback) => {
      readFile(file, (error2, data) => {
        if (error) {
          return eachCallback(error2);
        }

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

        return eachCallback();
      });
    }, (errorA) => {
      if (errorA) {
        return callback(errorA);
      }

      const options = { cwd: process.cwd() };
      const names = Array.from(modules).sort().join(' ');

      return readFile(process.cwd() + '/package.json', (error3, data) => {
        if (error3) {
          return callback(error3);
        }

        let json = JSON.parse(String(data));
        delete json.dependencies;

        json = JSON.stringify(json);

        return writeFile(process.cwd() + '/package.json', json, (error4) => {
          if (error4) {
            return callback(error4);
          }

          return exec('npm install ' + names, options, (error5) => {
            if (error5) {
              return callback(error5);
            }

            return exec('rm -rf node_modules', options, (error6) => {
              if (error6) {
                return callback(error6);
              }

              return exec('rm package-lock.json', options, (error7) => {
                if (error7) {
                  return callback(error7);
                }

                return callback();
              });
            });
          });
        });
      });
    });
  });

}
