# Optimus
Optimus is an asset optimizer and obfuscator that combines several tools. It
can be configured and integrated with other processes as a hook or script for
both client and server distributions.

## Usage
Add the GitHub path to your dependencies in `project.json`.

```json
"optimus": "sortiz4/optimus"
```

Import the the `optimus` function and call it with a `glob` compatible path and
your own options. All files will be modified in-place and your options will
replace these [defaults][1].

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
