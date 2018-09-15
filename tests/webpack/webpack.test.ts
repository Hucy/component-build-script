import { existsSync, removeSync } from 'fs-extra';
import 'jest';
import path from 'path';
import supertest from 'supertest';
import { IArguments, ICommandConf } from '~src/scripts/config';
import { build, start } from '~src/scripts/webpack';

beforeEach(() => {
  jest.resetModules();
});

function clean() {
  const cwd = process.cwd();
  const tempDir = path.resolve(cwd, `./${_FILE_SOURCE_}/scripts/.temp`);
  removeSync(tempDir);
  removeSync(`${cwd}/build`);
}

beforeAll(() => {
  clean();
});

afterAll(() => {
  clean();
});

const argsReact: IArguments = {
  'component-type': 'react',
  port: 3002,
};
const confReact: ICommandConf = {
  'script-type': 'ts',
  entry: './tests/webpack/index',
};
const argsVue: IArguments = {
  'component-type': 'vue',
  port: 3001,
};

const confVue: ICommandConf = {
  'script-type': 'js',
  entry: './tests/webpack/index_vue',
};

describe('dev server render should be success', () => {
  test('react dev server render should be success', async () => {
    expect.assertions(1);
    const server = await start(confReact, argsReact);
    const body = await new Promise(resolve => {
      supertest(`http://localhost:${argsReact.port}`)
        .get('/')
        .expect(200)
        .then(({ text }) => resolve(text));
    });
    expect(body).toMatch(/react/gi);
    await new Promise(resolve => {
      server.close(resolve);
    });
  });

  test('vue dev server render should be success', async () => {
    expect.assertions(1);
    const server = await start(confVue, argsVue);
    const body = await new Promise(resolve => {
      supertest(`http://localhost:${argsVue.port}`)
        .get('/')
        .expect(200)
        .then(({ text }) => resolve(text));
    });
    expect(body).toMatch(/vue/gi);
    await new Promise(resolve => {
      server.close(resolve);
    });
  });
});

test('webpack build should be success ', async () => {
  jest.setTimeout(30000);
  const cwd = process.cwd();
  await build(confReact, argsReact);
  expect(existsSync(`${cwd}/build/dist`)).toBe(true);
  expect(existsSync(`${cwd}/build/lib`)).toBe(true);
  expect(existsSync(`${cwd}/build/module`)).toBe(true);
  expect(existsSync(`${cwd}/build/typings`)).toBe(true);

  removeSync(`${cwd}/build`);

  await build(confVue, argsVue);
  expect(existsSync(`${cwd}/build/dist`)).toBe(true);
  expect(existsSync(`${cwd}/build/lib`)).toBe(false);
  expect(existsSync(`${cwd}/build/module`)).toBe(false);
  expect(existsSync(`${cwd}/build/typings`)).toBe(false);
});
