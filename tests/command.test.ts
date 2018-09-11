import 'jest';
import path from 'path';
import * as shell from 'shelljs';

const tsCil = path.resolve(process.cwd(), './node_modules/.bin/ts-node');
const cli = _FILE_SOURCE_ === 'src' ? `node ${tsCil}` : 'node';
const commandCli = path.resolve(process.cwd(), `./${_FILE_SOURCE_}/index`);

test('The command should be parsed correctly ', () => {
  return new Promise((resolve, reject) => {
    shell.exec(`${cli} ${commandCli} --help`, (code, stdout, stderr) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(stderr);
      }
    });
  });
});
