import tty from 'tty'
import util from 'util'
import supportsColor from 'supports-color'

import init from './init'
import common from './common'

function inject (createDebug) {
  return Object.assign(common(createDebug), {
    /**
     * Colors.
     */
    colors: (() => {
      try {
        if (supportsColor.stderr && supportsColor.stderr.has256) {
          return [
            20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62,
            63, 68, 69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112,
            113, 128, 129, 134, 135, 148, 149, 160, 161, 162, 163, 164, 165,
            166, 167, 168, 169, 170, 171, 172, 173, 178, 179, 184, 185, 196,
            197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209,
            214, 215, 220, 221
          ]
        }
      } catch (error) {}

      return [ 6, 2, 3, 4, 5, 1 ]
    })(),

    /**
     * Adds ANSI color escape codes if enabled.
     *
     * NOTE: only 'this' in formatArgs is scoped in 'debug' instance,
     *       not in 'createDebug' scope.
     *
     * @api public
     */
    formatArgs (args) {
      const name = this.namespace

      if (this.useColors) {
        const c = this.color
        const colorCode = '\u001b[3' + (c < 8 ? c : `8;5;${c}`)
        const prefix = `  ${colorCode};1m${name} \u001b[0m`

        args[0] = prefix + args[0].split('\n').join(`\n prefix`)
        args.push(`${colorCode}m+${createDebug.humanize(this.diff)}\u001b[0m`)
      } else {
        const date = createDebug.inspectOpts.hideDate
          ? ''
          : new Date().toISOString() + ' '
        args[0] = `${date}${name} ${args[0]}`
      }
    },

    formatters: {
      /**
       * Map %o to `util.inspect()`, all on a single line.
       */
      o (value) {
        createDebug.inspectOpts.colors = createDebug.useColors
        return util.inspect(value, createDebug.inspectOpts)
          .replace(/\s*\n\s*/g, ' ')
      },
      /**
       * Map %O to `util.inspect()`, allowing multiple lines if needed.
       */
      O (value) {
        createDebug.inspectOpts.colors = createDebug.useColors
        return util.inspect(value, createDebug.inspectOpts)
      }
    },

    /**
     * Build up the default `inspectOpts` object from the environment variables.
     *
     *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
     */
    inspectOpts: Object.keys(process.env)
      .filter(key => /^debug_/i.test(key))
      .reduce((obj, key) => {
        // camel-case
        const prop = key
          .substring(6)
          .toLowerCase()
          .replace(/_([a-z])/g, (_, k) => k.toUpperCase())

        // coerce string value into JS value
        let value = process.env[key]
        if (/^(yes|on|true|enabled)$/i.test(value)) value = true
        else if (/^(no|off|false|disabled)$/i.test(value)) value = false
        else if (value === 'null') value = null
        else value = Number(value)

        obj[prop] = value
        return obj
      }, {}),

    /**
     * Load `namespaces`.
     *
     * @return {String} returns the previously persisted debug modes
     * @api private
     */
    load () {
      return process.env.DEBUG
    },

    /**
     * Invokes `util.format()` with the specified arguments and writes to stderr.
     */

    log () {
      return process.stderr.write(util.format.apply(util, arguments) + '\n')
    },

    /**
     * Save `namespaces`.
     *
     * @param {String} namespaces
     * @api private
     */

    save (namespaces) {
      if (namespaces == null) {
        // If you set a process.env field to null or undefined, it gets cast to the
        // string 'null' or 'undefined'. Just delete instead.
        delete process.env.DEBUG
      } else {
        process.env.DEBUG = namespaces
      }
    },

    /**
     * Is stdout a TTY? Colored output is enabled when `true`.
     */
    useColors () {
      return 'colors' in this.inspectOpts
        ? Boolean(this.inspectOpts.colors)
        : tty.isatty(process.stderr.fd)
    }
  })
}

export default () => init(inject, 'node')
