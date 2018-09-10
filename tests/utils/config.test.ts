import { outputFileSync, pathExistsSync } from 'fs-extra';
import 'jest';
import mockFs from 'mock-fs';
import path from 'path';

afterEach(() => {
  mockFs.restore();
});

beforeEach(() => {
  jest.resetModules();
});

const mockInput = {
  'script-type': 'js',
  entry: './test/index',
};
const configPath = path.resolve(process.cwd(), './.cbs.json');
const configContent = {
  react: {
    'script-type': 'ts',
    entry: './test/index',
  },
};

test('if config exist return config', async () => {
  const { default: config } = await import('~src/scripts/config');
  mockFs();
  expect(pathExistsSync(configPath)).toBe(false);
  outputFileSync(configPath, JSON.stringify(configContent));
  const returnConfig = await config('react');
  expect(pathExistsSync(configPath)).toBe(true);
  expect(returnConfig).toMatchObject(configContent.react);
});

test('if config not exist creat config', async () => {
  jest.doMock('inquirer', () => {
    return {
      prompt: jest.fn(() => {
        mockFs();
        expect(pathExistsSync(configPath)).toBe(false);
        return Promise.resolve(mockInput);
      }),
    };
  });

  const { default: config } = await import('~src/scripts/config');
  const returnConfig = await config('react');
  expect(pathExistsSync(configPath)).toBe(true);
  expect(returnConfig).toMatchObject(mockInput);
});

test('if config exist append config', async () => {
  jest.doMock('inquirer', () => {
    return {
      prompt: jest.fn(() => {
        mockFs();
        outputFileSync(configPath, JSON.stringify(configContent));
        return Promise.resolve(mockInput);
      }),
    };
  });

  const { default: config } = await import('~src/scripts/config');
  const returnConfig = await config('vue');
  expect(pathExistsSync(configPath)).toBe(true);
  expect(returnConfig).toMatchObject(mockInput);
});
