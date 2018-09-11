import { existsSync, removeSync } from 'fs-extra';
import 'jest';
import path from 'path';
import supertest from 'supertest';
import { IArguments, ICommandConf } from '~src/scripts/config';
import { build, start } from '~src/scripts/webpack';

const conf: ICommandConf = {
  'script-type': 'ts',
  entry: './tests/webpack/index',
};

beforeEach(() => {
  jest.resetModules();
});

afterAll(() => {
  const cwd = process.cwd();
  const tempDir = path.resolve(cwd, `./${_FILE_SOURCE_}/scripts/.temp`);
  removeSync(tempDir);
  removeSync(`${cwd}/build`);
});

test('webpack dev server should be start', async () => {
  const args: IArguments = {
    'component-type': 'react',
    port: 3000,
  };
  const server = await start(conf, args);
  await supertest('http://localhost:3000')
    .get('/')
    .expect(200);
  await new Promise(resolve => {
    server.close(resolve);
  });
});

test('webpack build should be success ', async () => {
  const args: IArguments = {
    'component-type': 'react',
  };
  await build(conf, args);
  const cwd = process.cwd();
  expect(existsSync(`${cwd}/build/dist`)).toBe(true);
  expect(existsSync(`${cwd}/build/lib`)).toBe(true);
  expect(existsSync(`${cwd}/build/module`)).toBe(true);
  expect(existsSync(`${cwd}/build/typings`)).toBe(true);
});
