# Optimus
Optimus is an asset optimizer and obfuscator that combines several tools. It
can be configured and integrated with other processes as a hook or script for
both client and server distributions.

## Usage
Add the GitHub path to your dependencies in `project.json`.

```json
"optimus": "sortiz4/optimus"
```

As a command, `optimus` can be called with a list of `glob` compatible paths
and a mode or a configuration file. Import and extend one of the default
[options][1] or create your own.

```sh
Usage: optimus [options] [paths]

Options:
  -c, --config   The configuration file to use     [string] [default: "optimus.config.js"]
  -m, --mode     The name of the mode to use        [string] [choices: "mobile", "server"]
  -h, --help     Show help                                                       [boolean]
  -v, --version  Show version number                                             [boolean]
```

Much like the command, the `optimus` function can be called with a `glob`
compatible path and your own options based on these [defaults][1].

```js
const { optimus } = require('optimus');

await optimus('path/to/www', options);
```

As an Ionic + Cordova hook, the API is similar. Import the `hook` function and
export it as-is or call it with your own options. The hook should be added
under `build:after`, `before_build`, and `after_build`.

```js
const { hook } = require('optimus');

module.exports = environment => hook(environment, options);
```

[1]: https://github.com/sortiz4/optimus/blob/master/core.js#L5
