import * as path from 'path';
import writeFile from 'write';
import { scriptType, webpackComponent } from './config';

interface IEntry {
  type: webpackComponent;
  fileExtra: scriptType;
  entry: string;
}

export const tempEntryFile = (conf: IEntry): Promise<string> => {
  const componentFilePath = path.resolve(process.cwd(), `./${conf.entry}`);

  if (conf.type === 'browser') {
    return Promise.resolve(componentFilePath);
  }
  const tempDir = path.resolve(__dirname, './.temp');
  const entryFilePath = path.resolve(
    tempDir,
    `./${conf.type}_entry.${conf.fileExtra}`,
  );
  let data: string;
  switch (conf.type) {
    case 'vue':
      data = `
      import Vue from 'vue'
      import App from '${componentFilePath}'
      new Vue({
        el: '#root',
        render: h => h(App)
      })
      `;
      break;
    case 'react':
      const hotEntryFilePath = path.resolve(
        tempDir,
        `./react_hot_entry.${conf.fileExtra}`,
      );
      writeFile.sync(
        hotEntryFilePath,
        `
        import App from '${componentFilePath}'
        import { hot } from 'react-hot-loader'
        export default hot(module)(App)
      `,
        { flag: 'w+' },
      );
      data = `
      import React from 'react';
      import ReactDOM from "react-dom";
      import APP from '${hotEntryFilePath}'
      ReactDOM.render(
        <APP/>,
        document.getElementById('root')
      );`;
      break;
  }

  return writeFile(entryFilePath, data, { flag: 'w+' }).then(
    () => entryFilePath,
  );
};
