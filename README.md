# component-build-script

[![CircleCI](https://circleci.com/gh/Hucy/component-build-script.svg?style=svg)](https://circleci.com/gh/Hucy/component-build-script)
[![codecov](https://codecov.io/gh/Hucy/component-build-script/branch/master/graph/badge.svg)](https://codecov.io/gh/Hucy/component-build-script)
![npm type definitions](https://img.shields.io/npm/types/chalk.svg)

`component-build-script` 是一个快速开发和构建  `react`，`vue`，`node` 组件的命令行工具，帮助开发者将公用的组件剥离，而不必关心开发环境的配置。支持 ES 和 Typescript。

## 命令
```
  / ___| | __ )  / ___|
 | |     |  _ \  \___ \
 | |___  | |_) |  ___) |  \____| |____/  |____/

cbs <command>
Commands:
  cbs start <component-type>  start dev server
  cbs build <component-type>  build

Options:  --version  Show version number  [boolean]
  --help     Show help  [boolean]
```
## 如何使用


-  创建项目目录（如果已有可跳过）：

    `mkdir my-component`
    
    `cd my-component`

- 将`component-build-script`作为项目开发依赖进行安装（推荐）

    `npm install component-build-script -D`

- 设置 npm 脚本`package.json`

```json
    {
        "scripts":{
            "start":"cbs start",
            "build":"cbs build"
        }
    }
``` 

  Note:初次运行，会要求指定入口文件及开发语言

## 注意事项：

- `component-build-script` 适合开发组件并不适合应用。如需开发应用可选择相应优秀的工具，比如：[create-react-app](https://github.com/facebook/create-react-app),[vue-cli](https://github.com/vuejs/vue-cli)
- `cbs build`输出路径为
    
    + `build/dist` ：webapck输出文件，可用于浏览器使用
    + `build/lib` ：`commonjs` 文件
    + `build/module`: `Es module` 文件
    + `build/typings`：`Typescript` .d.ts 声明文件

- `babel runtime` 文件,需要将`runtime`文件写入 `dependencies` 具体参阅[@babel/plugin-transform-runtime](https://babeljs.io/docs/en/babel-plugin-transform-runtime)


-  示例`package.json`

    ```js
    // package.json
    {
        "main": "build/lib/index.js",
        "typings": "build/typings/index.d.ts",
        "module": "build/module/index.js",
        "scripts":{
            "start":"cbs start",
            "build":"cbs build"
        },
        "dependencies":{
            "@babel/runtime-corejs2": "^7.0.0"
        }
    }
