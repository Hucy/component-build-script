import { transformAsync } from '@babel/core';
import {
  copy,
  outputFile,
  readdir,
  readFile,
  removeSync,
  stat,
} from 'fs-extra';
import { render as lessRender } from 'less';
import { render as scssRender } from 'node-sass';
import nodemon from 'nodemon';
import * as path from 'path';
import postcss from 'postcss';
import modules from 'postcss-modules';
import postcssPresetEnv from 'postcss-preset-env';
import * as shell from 'shelljs';

import { ICommandConf } from './config';

type modType = 'node' | 'es';

export const start = (conf: ICommandConf): Promise<void> => {
  const startFile = path.resolve(
    process.cwd(),
    `${conf.entry}.${conf['script-type']}`,
  );
  const watchSrc = path.resolve(process.cwd(), path.dirname(conf.entry));
  nodemon({
    script: startFile,
    ext: conf['script-type'],
    watch: watchSrc,
    exec: `babel-node --no-babelrc --extensions .${
      conf['script-type']
    } --presets @babel/preset-env,@babel/preset-typescript`,
  });

  return Promise.resolve();
};

class Build {
  public static modulePathMap = {
    node: 'build/lib',
    es: 'build/module',
    type: 'build/typings',
  };
  public entry: string;
  public mod: modType;
  public cwd: string;
  public dir: string;
  constructor(entry: string, mod: modType) {
    this.entry = entry;
    this.mod = mod;
    this.cwd = process.cwd();
    this.dir = path.resolve(process.cwd(), path.dirname(this.entry));
    removeSync(path.resolve(process.cwd(), Build.modulePathMap[this.mod]));
  }

  public async init(fileDir?: string) {
    const dir = fileDir || this.dir;
    const fileList = await readdir(dir);

    await Promise.all(
      fileList.map(async file => {
        const filePath = path.resolve(dir, file);
        const fileStat = await stat(filePath);

        if (fileStat.isDirectory()) {
          return this.init(filePath);
        }

        const fileInfo = path.parse(filePath);
        switch (fileInfo.ext) {
          case '.ts':
          case '.tsx':
          case '.js':
          case '.jsx':
            return this.babelBuild(filePath);
          case '.css':
          case '.less':
          case '.scss':
          case '.sass':
            return this.styleBuild(filePath);
          default:
            return this.copy(filePath);
        }
      }),
    );

    return Promise.resolve();
  }

  public async babelBuild(filePath: string, file?: string): Promise<void> {
    const { name, dir } = path.parse(filePath);
    const dist = path.resolve(
      this.cwd,
      Build.modulePathMap[this.mod],
      path.relative(this.dir, dir),
      `${name}.js`,
    );

    const config = {
      presets: [
        [
          '@babel/preset-env',
          this.mod === 'es'
            ? {
                modules: false,
              }
            : {
                targets: ['node 4'],
              },
        ],
        [
          '@babel/preset-typescript',
          {
            isTSX: true,
            allExtensions: true,
          },
        ],
        '@babel/preset-react',
      ],
      plugins: [
        [
          'transform-rename-import',
          {
            original: '(.+\\/)(.+)\\.(less|css|scss|sass)$',
            replacement: '$1__style__/$2.$3.js',
          },
        ],
        [
          '@babel/plugin-transform-runtime',
          {
            corejs: 2,
          },
        ],
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-syntax-dynamic-import',
      ],
    };

    let sourceCode;
    if (file) {
      config.plugins.shift();
      sourceCode = file;
    } else {
      sourceCode = await readFile(filePath).then(b => b.toString());
    }

    const { code } = await transformAsync(sourceCode, config);

    return outputFile(dist, code);
  }

  public async styleBuild(styleFile: string): Promise<void> {
    const fileInfo = path.parse(styleFile);
    const dir = path.resolve(
      this.cwd,
      Build.modulePathMap[this.mod],
      path.relative(this.dir, fileInfo.dir),
    );

    const outFile = path.resolve(
      dir,
      `./__style__/${fileInfo.name}${fileInfo.ext}.css`,
    );
    const outStyleDependFile = path.resolve(
      dir,
      `./__style__/${fileInfo.name}${fileInfo.ext}.js`,
    );

    let cssFile = await readFile(styleFile);
    switch (fileInfo.ext) {
      case '.less':
        cssFile = await lessRender(cssFile.toString()).then(({ css }) =>
          Buffer.from(css),
        );
        break;
      case '.scss':
      case '.sass':
        cssFile = await new Promise<Buffer>((resolve, reject) => {
          scssRender({ file: styleFile }, (error, result) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(result.css);
          });
        });
        break;
    }

    return postcss([
      modules({
        getJSON: async (cssFileName, json) => {
          const depend = `
            // ${path.relative(process.cwd(), cssFileName)}
            import './${fileInfo.name}${fileInfo.ext}.css'
            export default ${JSON.stringify(json)}
          `;
          await this.babelBuild(outStyleDependFile, depend);
        },
        generateScopedName: '[name]__[local]--[hash:base64:5]',
      }),
      postcssPresetEnv(),
    ])
      .process(cssFile, { from: styleFile })
      .then(result => {
        return outputFile(outFile, result.css);
      });
  }

  public async copy(filePath: string): Promise<void> {
    const dist = path.resolve(
      this.cwd,
      Build.modulePathMap[this.mod],
      path.relative(this.dir, filePath),
    );
    return copy(filePath, dist);
  }
}

export const build = async (conf: ICommandConf): Promise<void> => {
  const buildLib = new Build(conf.entry, 'node');
  const buildModule = new Build(conf.entry, 'es');
  await Promise.all([buildLib.init(), buildModule.init()]);

  if (conf['script-type'] === 'ts') {
    shell.rm('-rf', 'build/typings');
    const tsCil = path.resolve(process.cwd(), './node_modules/.bin/tsc');
    const typeDir = path.resolve(process.cwd(), './build/typings');
    const tsDir = path.resolve(process.cwd(), path.dirname(conf.entry));
    shell.exec(
      `node ${tsCil} --declarationDir ${typeDir} --lib ES2017  -jsx react --typeRoots node_modules/@types --types node,react  --declaration --allowSyntheticDefaultImports --emitDeclarationOnly ${tsDir}/**/*.* ${tsDir}/*.*`,
    );
  }

  return Promise.resolve();
};
