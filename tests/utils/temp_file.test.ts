import { pathExists } from 'fs-extra';
import 'jest';
import mockFs from 'mock-fs';
import path from 'path';
import { tempEntryFile } from '~src/scripts/utils';

const tempDir = `${_FILE_SOURCE_}/scripts/.temp`;

describe('temp file should be success', () => {
  beforeEach(() => {
    mockFs();
  });

  afterEach(() => {
    mockFs.restore();
  });

  test('browser component entry file', async () => {
    expect.assertions(2);

    const entryPath = await tempEntryFile({
      type: 'browser',
      fileExtra: 'js',
      entry: './test/index',
    });
    expect(entryPath).toBe(path.resolve(process.cwd(), './test/index'));

    const isExist = await pathExists(path.resolve(process.cwd(), tempDir));
    expect(isExist).toBe(false);
  });

  test('react component entry file', async () => {
    expect.assertions(2);
    const entryPath = await tempEntryFile({
      type: 'react',
      fileExtra: 'js',
      entry: './test/index',
    });
    expect(entryPath).toBe(
      path.resolve(process.cwd(), tempDir, './react_entry.js'),
    );

    const isExist = await pathExists(
      path.resolve(process.cwd(), tempDir, './react_entry.js'),
    );
    expect(isExist).toBe(true);
  });

  test('vue component entry file', async () => {
    expect.assertions(2);
    const entryPath = await tempEntryFile({
      type: 'vue',
      fileExtra: 'js',
      entry: './test/index',
    });
    expect(entryPath).toBe(
      path.resolve(process.cwd(), tempDir, './vue_entry.js'),
    );

    const isExist = await pathExists(
      path.resolve(process.cwd(), tempDir, './vue_entry.js'),
    );
    expect(isExist).toBe(true);
  });
});
