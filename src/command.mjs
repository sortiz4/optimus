#!/usr/bin/env node
import fs from 'fs-extra';
import yargs from 'yargs';
import { OPTIONS_MOBILE, OPTIONS_SERVER, optimus } from './core.mjs';
import definition from '../package.json' assert { type: 'json' };

async function main() {
  function getCommandOptions() {
    const configurationOptions = {
      alias: 'configuration',
      string: true,
      default: '.optimusrc.json',
      description: 'The configuration file to use',
    };

    const nameOptions = {
      alias: 'name',
      string: true,
      choices: [
        OPTIONS_MOBILE.name,
        OPTIONS_SERVER.name,
      ],
      description: 'The name of the options set to use',
    };

    return (
      yargs(process.argv.slice(2))
        .usage(`Usage: $0 [options] [paths]`)
        .option('c', configurationOptions)
        .option('n', nameOptions)
        .scriptName(definition.name)
        .version(definition.version)
        .help()
        .alias({ h: 'help', v: 'version' })
        .wrap(98)
        .argv
    );
  }

  async function getOptimusOptions() {
    if (commandOptions.name) {
      return { name: commandOptions.name };
    }
    return await fs.readJSON(commandOptions.configuration);
  }

  async function runOptimus(name) {
    await optimus(name, optimusOptions);
  }

  const commandOptions = getCommandOptions();
  const optimusOptions = await getOptimusOptions();

  if (commandOptions._.length > 0) {
    await Promise.all(commandOptions._.map(runOptimus));
  }
}

try {
  await main();
} catch (error) {
  console.error(error);
}
