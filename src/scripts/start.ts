// start-module.js

import { Arguments, Argv, CommandModule } from 'yargs';

import { start as babelStart } from './babel';
import config, { component, ICommandConf } from './config';
import location from './i18n';
import { start as webpackStart } from './webpack';

const {
  start: { describe, port, componentType },
} = location;

class Start implements CommandModule {
  public readonly command: string;
  public readonly describe: string;
  constructor() {
    this.command = 'start <component-type>';
    this.describe = describe;
  }
  public builder(args: Argv): Argv {
    args.positional('component-type', {
      describe: componentType,
      type: 'string',
      choices: ['react', 'vue', 'browser', 'node'],
    });
    args.options({
      port: {
        alias: 'p',
        default: 3000,
        defaultDescription: '3000',
        desc: port,
        number: true,
        require: false,
      },
    });
    return args;
  }

  public handler(args: Arguments): void {
    const buildComponentType: component = args['component-type'];
    const serverPort: number = args.port;
    config(buildComponentType).then((conf: ICommandConf) => {
      switch (buildComponentType) {
        case 'react':
        case 'vue':
        case 'browser':
          webpackStart(conf, {
            'component-type': buildComponentType,
            port: serverPort,
          });
          break;
        case 'node':
          babelStart(conf);
          break;
      }
    });
  }
}

export default new Start();
