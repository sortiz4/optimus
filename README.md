# Optimus
Optimus is an asset optimizer and obfuscator that combines several tools. It
can be configured and integrated with other processes as a hook or script for
both client and server distributions.

## Usage
Optimus can be installed as a global command or local package.

```sh
npm install -g github:sortiz4/optimus#1.1.0
```

```json
"optimus": "github:sortiz4/optimus#1.1.0"
```

As a command, `optimus` can be called with a list of `glob` compatible paths
and an options name or a configuration file. Import and extend one of the
[default][1] options or create your own.

```sh
Usage: optimus [options] [paths]

Options:
  -c, --configuration  The configuration file to use        [string] [default: ".optimusrc.js"]
  -n, --name           The name of the options to use    [string] [choices: "mobile", "server"]
  -h, --help           Show help                                                      [boolean]
  -v, --version        Show version number                                            [boolean]
```

Much like the command, the `optimus` function can be called with a `glob`
compatible path and your own options based on these [defaults][1]. The
associated options will be selected when an options name is given.

```js
const { optimus } = require('optimus');

await optimus('node_modules', { name: 'server' });
```

As an Ionic + Cordova hook, the API is similar. Import the `hook` function and
export it as-is or call it with your own options. The hook should be added
under `build:after`, `before_build`, and `after_build`.

```js
const { cordova } = require('optimus');

module.exports = environment => cordova(environment, { name: 'mobile' });
```

[1]: https://github.com/sortiz4/optimus/blob/master/src/core.js#L5
