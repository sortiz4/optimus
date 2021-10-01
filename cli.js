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

    const modeOptions = {
      alias: 'mode',
      string: true,
      choices: [
        OPTIONS_MOBILE.mode,
        OPTIONS_SERVER.mode,
      ],
      description: 'The name of the mode to use',
    };

    return (
      yargs(process.argv.slice(2))
        .usage(`Usage: $0 [options] [paths]`)
        .option('c', configOptions)
        .option('m', modeOptions)
        .scriptName(name)
        .version(version)
        .help()
        .alias({ h: 'help', v: 'version' })
        .wrap(90)
        .argv
    )
  }

  function getOptimusOptions() {
    if (commandOptions.mode) {
      return { mode: commandOptions.mode };
    }
    return require(path.resolve(commandOptions.config));
  }

  async function runOptimus(name) {
    await optimus(name, optimusOptions);
  }

  const commandOptions = getCommandOptions();
  const optimusOptions = getOptimusOptions();

  await Promise.all(commandOptions._.map(runOptimus));
}

if (require.main === module) {
  main().catch(error => console.error(error));
}
