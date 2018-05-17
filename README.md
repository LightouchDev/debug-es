# debug-es

[![Build Status](https://travis-ci.org/LightouchDev/debug-es.svg?branch=master)](https://travis-ci.org/LightouchDev/debug-es)
[![Coverage Status](https://coveralls.io/repos/github/LightouchDev/debug-es/badge.svg?branch=master)](https://coveralls.io/github/LightouchDev/debug-es?branch=master)
[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

<img width="647" src="https://user-images.githubusercontent.com/71256/29091486-fa38524c-7c37-11e7-895f-e7ec8e1039b6.png">

A tiny JavaScript debugging utility modelled after Node.js core's debugging
technique. Works in Node.js and web browsers.

NOTE: it's a fork of [`debug`](https://github.com/visionmedia/debug) for contribution. (original package is no update for about six months.)

## Installation

```bash
$ npm install debug-es
or
$ yarn add debug-es
```

## Requirement

- ES6 support
  - node >= 6
  - node 4 (not tested)

## Usage

`debug-es` exposes a function; simply pass this function the name of your module, and it will return a decorated version of `console.error` for you to pass debug statements to. This will allow you to toggle the debug output for different parts of your module as well as the module as a whole.

```js
const debug = require('debug-es')('http')
const http = require('http')
const name = 'My App'

// fake app

debug('booting %o', name)

http.createServer((req, res) => {
  debug(`${req.method} ${req.url}`)
  res.end('hello\n')
}).listen(3000, () => debug('listening'))

// fake worker of some kind

require('./worker')
```

```js
const a = require('debug-es')('worker:a')
const b = require('debug-es')('worker:b')

function work() {
  a('doing lots of uninteresting work')
  setTimeout(work, Math.random() * 1000)
}

work()

function workb() {
  b('doing some work')
  setTimeout(workb, Math.random() * 2000)
}

workb()
```

The `DEBUG` environment variable is then used to enable these based on space or
comma-delimited names.

Here are some examples:

<img width="647" alt="screen shot 2017-08-08 at 12 53 04 pm" src="https://user-images.githubusercontent.com/71256/29091703-a6302cdc-7c38-11e7-8304-7c0b3bc600cd.png">
<img width="647" alt="screen shot 2017-08-08 at 12 53 38 pm" src="https://user-images.githubusercontent.com/71256/29091700-a62a6888-7c38-11e7-800b-db911291ca2b.png">
<img width="647" alt="screen shot 2017-08-08 at 12 53 25 pm" src="https://user-images.githubusercontent.com/71256/29091701-a62ea114-7c38-11e7-826a-2692bedca740.png">

### Windows note

On Windows the environment variable is set using the `set` command.

```cmd
set DEBUG=*,-not_this
```

Note that PowerShell uses different syntax to set environment variables.

```cmd
$env:DEBUG = "*,-not_this"
```

Then, run the program to be debugged as usual.

## Namespace Colors

Every debug instance has a color generated for it based on its namespace name.
This helps when visually parsing the debug output to identify which debug instance
a debug line belongs to.

### Node.js

In Node.js, colors are enabled when stderr is a TTY. You also _should_ install
the [`supports-color`](https://npmjs.org/supports-color) module alongside debug,
otherwise debug will only use a small handful of basic colors.

<img width="521" src="https://user-images.githubusercontent.com/71256/29092181-47f6a9e6-7c3a-11e7-9a14-1928d8a711cd.png">

### Web Browser

Colors are also enabled on "Web Inspectors" that understand the `%c` formatting
option. These are WebKit web inspectors, Firefox ([since version
31](https://hacks.mozilla.org/2014/05/editable-box-model-multiple-selection-sublime-text-keys-much-more-firefox-developer-tools-episode-31/))
and the Firebug plugin for Firefox (any version).

<img width="524" src="https://user-images.githubusercontent.com/71256/29092033-b65f9f2e-7c39-11e7-8e32-f6f0d8e865c1.png">

## Millisecond diff

When actively developing an application it can be useful to see when the time spent between one `debug()` call and the next. Suppose for example you invoke `debug()` before requesting a resource, and after as well, the "+NNNms" will show you how much time was spent between calls.

<img width="647" src="https://user-images.githubusercontent.com/71256/29091486-fa38524c-7c37-11e7-895f-e7ec8e1039b6.png">

When stdout is not a TTY, `Date#toISOString()` is used, making it more useful for logging the debug information as shown below:

<img width="647" src="https://user-images.githubusercontent.com/71256/29091956-6bd78372-7c39-11e7-8c55-c948396d6edd.png">

## Conventions

If you're using this in one or more of your libraries, you _should_ use the name of your library so that developers may toggle debugging as desired without guessing names. If you have more than one debuggers you _should_ prefix them with your library name and use ":" to separate features. For example "bodyParser" from Connect would then be "connect:bodyParser".  If you append a "*" to the end of your name, it will always be enabled regardless of the setting of the DEBUG environment variable.  You can then use it for normal output as well as debug output.

## Wildcards

The `*` character may be used as a wildcard. Suppose for example your library has
debuggers named "connect:bodyParser", "connect:compress", "connect:session",
instead of listing all three with
`DEBUG=connect:bodyParser,connect:compress,connect:session`, you may simply do
`DEBUG=connect:*`, or to run everything using this module simply use `DEBUG=*`.

You can also exclude specific debuggers by prefixing them with a "-" character.
For example, `DEBUG=*,-connect:*` would include all debuggers except those
starting with "connect:".

## Environment Variables

When running through Node.js, you can set a few environment variables that will
change the behavior of the debug logging:

| Name      | Purpose                                         |
|-----------|-------------------------------------------------|
| `DEBUG`   | Enables/disables specific debugging namespaces. |
| `DEBUG_HIDE_DATE` | Hide date from debug output (non-TTY).  |
| `DEBUG_COLORS`| Whether or not to use colors in the debug output. |
| `DEBUG_DEPTH` | Object inspection depth.                    |
| `DEBUG_SHOW_HIDDEN` | Shows hidden properties on inspected objects. |

__Note:__ The environment variables beginning with `DEBUG_` end up being
converted into an Options object that gets used with `%o`/`%O` formatters.
See the Node.js documentation for
[`util.inspect()`](https://nodejs.org/api/util.html#util_util_inspect_object_options)
for the complete list.

## Formatters

Debug uses [printf-style](https://wikipedia.org/wiki/Printf_format_string) formatting.
Below are the officially supported formatters:

| Formatter | Representation |
|-----------|----------------|
| `%O`      | Pretty-print an Object on multiple lines. |
| `%o`      | Pretty-print an Object all on a single line. |
| `%s`      | String. |
| `%d`      | Number (both integer and float). |
| `%j`      | JSON. Replaced with the string '[Circular]' if the argument contains circular references. |
| `%%`      | Single percent sign ('%'). This does not consume an argument. |

### Custom formatters

You can add custom formatters by extending the `debug.formatters` object.
For example, if you wanted to add support for rendering a Buffer as hex with
`%h`, you could do something like:

```js
const createDebug = require('debug-es')
createDebug.formatters.h = (v) => {
  return v.toString('hex')
}

// ...elsewhere
const debug = createDebug('foo')
debug('this is hex: %h', new Buffer('hello world'))
//   foo this is hex: 68656c6c6f20776f726c6421 +0ms
```

## Browser Support

Debug's enable state is currently persisted by `localStorage`.
Consider the situation shown below where you have `worker:a` and `worker:b`,
and wish to debug both. You can enable this using `localStorage.debug`:

```js
localStorage.debug = 'worker:*'
```

And then refresh the page.

```js
const a = debug('worker:a')
const b = debug('worker:b')

setInterval(function(){
  a('doing some work')
}, 1000)

setInterval(function(){
  b('doing some work')
}, 1200)
```

## Output streams

  By default `debug` will log to stderr, however this can be configured per-namespace by overriding the `log` method:

```js
const debug = require('debug-es')
const error = debug('app:error')

// by default stderr is used
error('goes to stderr!')

const log = debug('app:log')
// set this namespace to log via console.log
log.log = console.log.bind(console) // don't forget to bind to console!
log('goes to stdout')
error('still goes to stderr!')

// set all output to go via console.info
// overrides all per-namespace log settings
debug.log = console.info.bind(console)
error('now goes to stdout via console.info')
log('still goes to stdout, but via console.info now')
```

## Set dynamically

You can also enable debug dynamically by calling the `enable()` method :

```js
let debug = require('debug-es')

console.log(1, debug.enabler('test'))

debug.enable('test')
console.log(2, debug.enabler('test'))

debug.disable()
console.log(3, debug.enabler('test'))

```

print :

```plain
1 false
2 true
3 false
```

Usage :
`enable(namespaces)`
`namespaces` can include modes separated by a colon and wildcards.

Note that calling `enable()` completely overrides previously set DEBUG variable :

```bash
$ DEBUG=foo node -e 'const dbg = require("debug-es"); dbg.enable("bar"); console.log(dbg.enabler("foo"))'
=> false
```

## Checking whether a debug target is enabled

After you've created a debug instance, you can determine whether or not it is
enabled by checking the `enabled` property:

```javascript
const debug = require('debug-es')('http')

if (debug.enabled) {
  // do stuff...
}
```

You can also manually toggle this property to force the debug instance to be
enabled or disabled.

## Authors

- TJ Holowaychuk
- Nathan Rajlich
- Andrew Rhyne
- Miau Lightouch

## License

(The MIT License)

Copyright (c) 2014-2017 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
