import init from './init'
import common from './common'

/**
 * Stringify without circular issue
 * @param {any} content
 */
function safeStringify (content) {
  const cache = []

  return JSON.stringify(content, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return
      }
      // Store value in our collection
      cache.push(value)
    }
    return value
  })
}

function inject (createDebug) {
  return Object.assign(common(createDebug), {
    /**
     * Colors.
     */
    colors: [
      '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
      '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
      '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
      '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
      '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
      '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
      '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
      '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
      '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
      '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
      '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
    ],

    /**
     * Colorize log arguments if enabled.
     *
     * NOTE: only 'this' in formatArgs is scoped in 'debug' instance,
     *       not in 'createDebug' scope.
     *
     * @api public
     */
    formatArgs (args) {
      const cTag = this.useColors ? '%c' : ''
      args[0] =
        cTag + this.namespace + ' ' +
        cTag + args[0] + ' ' +
        cTag + '+' + createDebug.humanize(this.diff)

      if (!this.useColors) return
      const currentStyle = `color: ${this.color}`
      args.splice(1, 0, currentStyle, 'color: inherit')

      // the final '%c' is somewhat tricky, because there could be other
      // arguments passed either before or after the %c, so we need to
      // figure out the correct index to insert the CSS into
      let index = 0
      let lastC = 0
      args[0].replace(/%[a-zA-Z%]/g, match => {
        if (match === '%%') return
        index++
        if (match === '%c') {
          // we only are interested in the *last* %c
          // (the user may have provided their own)
          lastC = index
        }
      })
      args.splice(lastC, 0, currentStyle)
    },

    /**
     * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
     */
    formatters: {
      j (value) {
        try {
          return safeStringify(value)
        } catch (error) {
          return `[UnexpectedJSONParseError]: ${error.message}`
        }
      }
    },

    /**
     * Load `namespaces`.
     *
     * @return {String} returns the previously persisted debug modes
     * @api private
     */
    load () {
      let namespaces
      try {
        namespaces = createDebug.storage.getItem('debug')
      } catch (error) {}

      // If debug isn't set in LS, and we're in Electron/nwjs, try to load $DEBUG
      if (!namespaces && typeof process !== 'undefined' && 'env' in process) {
        namespaces = process.env.DEBUG
      }

      return namespaces
    },

    /**
     * Invokes `console.log()` when available.
     * No-op when `console.log` is not a "function".
     *
     * @api public
     */
    /* eslint-disable no-console */
    log () {
      return (
        typeof console === 'object' &&
        console.log &&
        Function.prototype.apply.call(console.log, console, arguments)
      )
    },
    /* eslint-enable no-console */

    /**
     * Save `namespaces`.
     *
     * @param {String} namespaces
     * @api private
     */
    save (namespaces) {
      try {
        if (namespaces == null) {
          createDebug.storage.removeItem('debug')
        } else {
          createDebug.storage.setItem('debug', namespaces)
        }
      } catch (error) {}
    },

    /**
     * LocalStorage attempts to return the LocalStorage.
     *
     * This is necessary because safari throws
     * when a user disables cookies/LocalStorage
     * and you attempt to access it.
     *
     * @return {LocalStorage|null}
     * @api private
     */
    storage: (() => {
      try {
        // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
        // The Browser also has localStorage in the global context.
        return localStorage
      } catch (error) {}
    })(),

    /**
     * TODO: add a `localStorage` variable to explicitly enable/disable colors
     */
    useColors () {
      // NB: In an Electron preload script, document will be defined but not fully
      // initialized. Since we know we're in Chrome, we'll just detect this case
      // explicitly
      if (
        typeof window !== 'undefined' &&
        window.process &&
        (window.process.type === 'renderer' || window.process.__nwjs)
      ) return true

      // check userAgent
      if (typeof navigator !== 'undefined' && navigator.userAgent) {
        const UA = navigator.userAgent.toLowerCase()

        // Internet Explorer do not support colors.
        if (UA.match(/trident\/\d+/)) return false

        // Microsoft Edge < 16.16215 do not support colors.
        if (UA.match(/edge\/(\d+)\.(\d+)/)) {
          return (parseInt(RegExp.$1, 10) >= 16) && (parseInt(RegExp.$2, 10) >= 16215)
        }

        // is firefox >= v31?
        // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
        if (UA.match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) return true

        // double check webkit in userAgent just in case we are in a worker
        if (UA.match(/applewebkit\/\d+/)) return true
      }
      return false
    }
  })
}

export default () => init(inject, 'browser')
