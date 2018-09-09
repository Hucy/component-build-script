import { existsSync, removeSync } from 'fs-extra';
import 'jest';

import { build, start } from '~src/scripts/babel';
import { ICommandConf } from '~src/scripts/config';

const cwd = process.cwd();
beforeEach(() => {
  jest.resetModules();
});

afterEach(() => {
  removeSync(`${cwd}/build`);
});

test('node start with ts should be success', async () => {
  const conf: ICommandConf = {
    'script-type': 'ts',
    entry: './tests/babel/index',
  };
  await start(conf);
});

test('node build with js should be success', async () => {
  const conf: ICommandConf = {
    'script-type': 'js',
    entry: './tests/babel/index',
  };
  await build(conf);
  expect(existsSync(`${cwd}/build/lib`)).toBe(true);
  expect(existsSync(`${cwd}/build/module`)).toBe(true);
  expect(existsSync(`${cwd}/build/typings`)).toBe(false);
});
