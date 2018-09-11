# component-build-script

[![CircleCI](https://circleci.com/gh/Hucy/component-build-script.svg?style=svg)](https://circleci.com/gh/Hucy/component-build-script)
[![codecov](https://codecov.io/gh/Hucy/component-build-script/branch/master/graph/badge.svg)](https://codecov.io/gh/Hucy/component-build-script)
![npm type definitions](https://img.shields.io/npm/types/chalk.svg)

English | [中文](./README-zh_CN.md)

`component-build-script` is a command-line tool for quickly developing and building react, vue, and node components that help developers strip common components without having to worry about the configuration of the development environment. Support for ES and Typescript.

## command
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
## How to use


-  Create a project directory (if you can skip it):

    `mkdir my-component`
    
    `cd my-component`

- Install `component-build-script` as a project development dependency (recommended)

    `npm install component-build-script -D`

- Set the npm script `package.json`

```json
    {
        "scripts":{
            "start":"cbs start react",
            "build":"cbs build react"
        }
    }
``` 

  Note: For the first run, you will be asked to specify the entry file and development language.

## Precautions:

- `component-build-script` is suitable for development components and is not suitable for applications. If you need to develop an application, you can choose the corresponding excellent tools, such as:[create-react-app](https://github.com/facebook/create-react-app),[vue-cli](https://github.com/vuejs/vue-cli)

- `cbs build` output path
    
    + `build/dist` : Webpack output file for browser use
    + `build/lib` :`commonjs` file
    + `build/module`: `Es module` file
    + `build/typings`：`Typescript` .d.ts declaration file

- `babel runtime` file, you need to write `runtime` file to `dependencies`
[@babel/plugin-transform-runtime](https://babeljs.io/docs/en/babel-plugin-transform-runtime)


-  Example `package.json`

    ```js
    // package.json
    {
        "main": "build/lib/index.js",
        "typings": "build/typings/index.d.ts",
        "module": "build/module/index.js",
        "scripts":{
            "start":"cbs start react",
            "build":"cbs build react"
        },
        "dependencies":{
            "@babel/runtime-corejs2": "^7.0.0"
        }
    }