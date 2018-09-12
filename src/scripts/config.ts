import chalk from 'chalk';
import * as fs from 'fs';
import { outputFile } from 'fs-extra';
import * as inquirer from 'inquirer';
import * as path from 'path';
import location from './i18n';

export type component = webpackComponent | 'node';
export type webpackComponent = 'vue' | 'react' | 'browser';
export type scriptType = 'js' | 'ts';
type abbr = 'JavaScript' | 'TypeScript';

export interface IArguments {
  'component-type': webpackComponent;
  port?: number;
}

enum typeMap {
  JavaScript = 'js',
  TypeScript = 'ts',
}

export interface ICommandConf {
  'script-type': scriptType;
  entry: string;
}

interface IConfig {
  react: ICommandConf;
  vue: ICommandConf;
}

const {
  init: { scriptType, message, entry, complete },
} = location;

function config(componentType: component): Promise<ICommandConf> {
  const configPath = path.resolve(process.cwd(), './.cbs.json');
  const configured = fs.existsSync(configPath);
  let configMap: IConfig;
  if (configured) {
    configMap = JSON.parse(fs.readFileSync(configPath).toString());
  }

  if (configured && configMap[componentType]) {
    return Promise.resolve(configMap[componentType]);
  }

  console.log(chalk.yellow('\n'), chalk.yellow(message));

  return inquirer
    .prompt([
      {
        type: 'list',
        name: 'script-type',
        message: scriptType,
        choices: ['JavaScript', 'TypeScript'],
        default: 'TypeScript',
        filter: (val: abbr) => {
          return typeMap[val];
        },
      },
      {
        type: 'input',
        name: 'entry',
        message: entry,
        default: './src/index',
      },
    ])
    .then((answers: ICommandConf) => {
      const componentConfig = {
        ...answers,
      };

      const configFile = configMap
        ? {
            ...configMap,
            [componentType]: componentConfig,
          }
        : {
            [componentType]: componentConfig,
          };
      return outputFile(
        configPath,
        JSON.stringify(configFile, null, '  '),
      ).then(() => {
        console.log(chalk.bgGreen(complete));
        return componentConfig;
      });
    });
}
export default config;
