import * as yargs from 'yargs';

type i18nType = 'zh_CN' | string;

export interface Ii18nCommand {
  describe: string;
  componentType: string;
}

export interface Ii18nInit {
  scriptType: string;
  message: string;
  entry: string;
  complete: string;
}
export interface Ii18nStart extends Ii18nCommand {
  port: string;
}

export interface Ii18nBuild extends Ii18nCommand {
  base: string;
  normal: string;
  module: string;
  success: string;
}
export interface Ii18n {
  start: Ii18nStart;
  build: Ii18nBuild;
  init: Ii18nInit;
}

function i18n(): Ii18n {
  const locale: i18nType = yargs.locale();
  switch (locale) {
    case 'zh_CN':
      return {
        start: {
          describe: '启动开发服务器',
          port: '开发服务器端口',
          componentType: '构建组件类型',
        },
        build: {
          describe: '构建',
          componentType: '构建组件类型',
          base: '开始构建 \n',
          normal: '开始构建 commonjs 模块 \n',
          module: '开始构建 ES 模块 \n',
          success: '构建成功 \n',
        },
        init: {
          scriptType: '构建文件类型',
          message: '初始化构建配置（仅在第一次构建时需要）',
          entry: '加载的入口文件',
          complete: '配置文件写入成功',
        },
      };
    default:
      return {
        start: {
          describe: 'start dev server',
          port: 'the port use with dev server',
          componentType: 'build component type',
        },
        build: {
          base: 'Start building \n',
          describe: 'build',
          componentType: 'Build component type',
          normal: 'Start building the commonjs module \n',
          module: 'Start building the ES module \n',
          success: 'Successful build \n',
        },
        init: {
          scriptType: 'build file type',
          message: 'init build config(Only needed for the first build)',
          entry: 'the entry file to use',
          complete: 'The configuration file was successfully written.',
        },
      };
  }
}

const location: Ii18n = i18n();

export default location;
