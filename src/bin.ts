import fs from 'fs-extra';
import process from 'node:process';
import yargs, { Options as YargsOptions } from 'yargs';
import { OPTIONS_MOBILE, OPTIONS_SERVER, PartialOptimusOptions, optimus } from './main.ts';
import metadata from '../package.json' with { type: 'json' };

interface Options {
  readonly _: string[];
  readonly name?: string;
  readonly configuration: string;
}

async function main(): Promise<void> {
  function getCommandOptions(): Options {
    const configurationOptions: YargsOptions = {
      alias: 'configuration',
      string: true,
      default: '.optimusrc.json',
      description: 'The configuration file to use',
    };

    const nameOptions: YargsOptions = {
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
        .scriptName(metadata.name)
        .version(metadata.version)
        .help()
        .wrap(98)
        .usage(`Usage: $0 [options] [paths]`)
        .option('c', configurationOptions)
        .option('n', nameOptions)
        .alias({ h: 'help', v: 'version' })
        .argv as unknown as Options
    );
  }

  async function getOptimusOptions(): Promise<PartialOptimusOptions | undefined> {
    if (commandOptions.name) {
      return {
        name: commandOptions.name,
      };
    }

    try {
      return await fs.readJSON(commandOptions.configuration);
    } catch {
      // The configuration file doesn't exist
    }
  }

  async function runOptimus(name: string): Promise<void> {
    await optimus(name, optimusOptions);
  }

  const commandOptions = getCommandOptions();
  const optimusOptions = await getOptimusOptions();

  if (commandOptions._.length > 0) {
    await Promise.all(commandOptions._.map(runOptimus));
  }
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error(error);
  }
}
