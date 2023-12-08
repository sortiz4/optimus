# Optimus
Optimus is an asset optimizer and obfuscator that combines several tools. It
can be configured and integrated with other processes as a hook or script for
both client and server distributions.

## Usage
Optimus can be installed as a global command or local package.

```sh
npm install -g github:sortiz4/optimus#2.0.0
```

```json
"optimus": "github:sortiz4/optimus#2.0.0"
```

As a command, `optimus` can be called with a list of `glob` compatible paths
and an options name or a configuration file. Import and extend one of the
[default][1] options or create your own.

```sh
Usage: optimus [options] [paths]

Options:
  -c, --configuration  The configuration file to use         [string] [default: ".optimusrc.json"]
  -n, --name           The name of the options set to use   [string] [choices: "mobile", "server"]
  -h, --help           Show help                                                         [boolean]
  -v, --version        Show version number                                               [boolean]
```

Much like the command, the `optimus` function can be called with a `glob`
compatible path and your own options based on these [defaults][1]. The
associated options will be selected when an options name is given.

```js
import { optimus } from 'optimus';

await optimus('node_modules', { name: 'server' });
```

[1]: https://github.com/sortiz4/optimus/blob/master/src/core.ts#L6
