#!/usr/bin/env node
import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import * as yargs from 'yargs';

import build from './scripts/build';
import start from './scripts/start';

// Clear the terminal and print the message
clear();
console.log(chalk.yellow(figlet.textSync('CBS', { horizontalLayout: 'full' })));

const argv = yargs
  .command(start)
  .command(build)
  .demandCommand(1)
  .help()
  .wrap(null).argv;

export default argv;
