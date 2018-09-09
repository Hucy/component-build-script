// build-module.js

import chalk from 'chalk';
import { Arguments, Argv, CommandModule } from 'yargs';

import { build as babelBuild } from './babel';
import config, { component, ICommandConf } from './config';
import location from './i18n';
import { build as webpackBuild } from './webpack';

const {
  build: { describe, componentType, success, base },
} = location;

class Build implements CommandModule {
  public readonly command: string;
  public readonly describe: string;
  constructor() {
    this.command = 'build <component-type>';
    this.describe = describe;
  }

  public builder(args: Argv): Argv {
    args.positional('component-type', {
      describe: componentType,
      type: 'string',
      choices: ['react', 'vue', 'browser', 'node'],
    });
    return args;
  }

  public handler(args: Arguments): void {
    const buildComponentType: component = args['component-type'];

    console.log(chalk.bgCyan(base));

    config(buildComponentType)
      .then((conf: ICommandConf) => {
        switch (buildComponentType) {
          case 'react':
          case 'vue':
          case 'browser':
            return webpackBuild(conf, {
              'component-type': buildComponentType,
            });
          case 'node':
            return babelBuild(conf);
            break;
        }
      })
      .then(() => {
        console.log(chalk.bgGreen(success));
      });
  }
}

export default new Build();
