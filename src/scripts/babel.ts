import nodemon from 'nodemon';
import * as path from 'path';
import * as shell from 'shelljs';
import { ICommandConf } from './config';

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

export const build = (conf: ICommandConf): Promise<void> => {
  const babelCil = path.resolve(process.cwd(), './node_modules/.bin/babel');
  const babelConfigFile = path.resolve(__dirname, './babelrc');
  const babelModuleConfigFile = path.resolve(__dirname, './module.babelrc');
  const buildSrc = path.dirname(conf.entry);
  const extensions = conf['script-type'] === 'ts' ? '.ts,.tsx' : '.js,.jsx';

  shell.rm('-rf', 'build/lib', 'build/module');

  shell.exec(
    `node ${babelCil} ${buildSrc} --out-dir build/lib --config-file ${babelConfigFile} --no-babelrc --extensions=${extensions} --env-name production --copy-files`,
  );

  shell.exec(
    `node ${babelCil} ${buildSrc} --out-dir build/module --config-file ${babelModuleConfigFile} --no-babelrc --extensions=${extensions} --env-name production --copy-files`,
  );

  if (conf['script-type'] === 'ts') {
    shell.rm('-rf', 'build/typings');
    const tsCil = path.resolve(process.cwd(), './node_modules/.bin/tsc');
    const typeDir = path.resolve(process.cwd(), './build/typings');
    const tsDir = path.resolve(process.cwd(), buildSrc);
    shell.exec(
      `node ${tsCil} --declarationDir ${typeDir} --lib ES2017  -jsx react --typeRoots node_modules/@types --types node,react  --declaration --allowSyntheticDefaultImports --emitDeclarationOnly ${tsDir}/**/*.* ${tsDir}/*.*`,
    );
  }

  return Promise.resolve();
};
