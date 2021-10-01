#!/usr/bin/env node
const path = require('path');
const yargs = require('yargs');
const { OPTIONS_MOBILE, OPTIONS_SERVER, optimus } = require('./core');
const { name, version } = require('./package.json');

async function main() {
  function getCommandOptions() {
    const configOptions = {
      alias: 'config',
      string: true,
      default: 'optimus.config.js',
      description: 'The configuration file to use',
    };

    const methodOptions = {
      alias: 'method',
      string: true,
      choices: [
        OPTIONS_MOBILE.name,
        OPTIONS_SERVER.name,
      ],
      description: 'The name of the method to use',
    };

    return (
      yargs(process.argv.slice(2))
        .usage(`Usage: $0 [options] [paths]`)
        .option('c', configOptions)
        .option('m', methodOptions)
        .scriptName(name)
        .version(version)
        .help()
        .alias({ h: 'help', v: 'version' })
        .wrap(90)
        .argv
    )
  }

  function getOptimusOptions() {
    if (commandOptions.name) {
      return { name: commandOptions.name };
    }
    return require(path.resolve(commandOptions.config));
  }

  async function runOptimus(name) {
    await optimus(name, optimusOptions);
  }

  const commandOptions = getCommandOptions();
  const optimusOptions = getOptimusOptions();

  if (commandOptions._.length > 0) {
    await Promise.all(commandOptions._.map(runOptimus));
  }
}

if (require.main === module) {
  main().catch(error => console.error(error));
}
