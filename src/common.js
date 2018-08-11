import ms from 'ms'

export default createDebug => ({
  colors: [],

  /**
   * Active `debug` instances.
   */
  instances: [],

  /**
   * The currently active debug mode names, and names to skip.
   */
  names: [],
  skips: [],

  /**
   * Map of special "%n" handling functions, for the debug "format" argument.
   *
   * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
   */
  formatters: {},

  humanize: ms,

  /**
   * Coerce `value`.
   *
   * @param {Mixed} value
   * @return {Mixed}
   * @api private
   */
  coerce (value) {
    if (value instanceof Error) return value.stack || value.message
    return value
  },

  /**
   * Disable debug output.
   *
   * @api public
   */
  disable () {
    createDebug.enable('')
  },

  /**
   * Enables a debug mode by namespaces. This can include modes
   * separated by a colon and wildcards.
   *
   * @param {String} namespaces
   * @api public
   */
  enable (namespaces) {
    createDebug.save(namespaces)

    createDebug.names = []
    createDebug.skips = []
    ;(typeof namespaces === 'string' ? namespaces : '')
      .split(/[\s,]+/)
      .forEach(item => {
        if (!item) return // ignore empty strings
        const name = item.replace(/\*/g, '.*?')
        name[0] === '-'
          ? createDebug.skips.push(new RegExp(`^${name.substr(1)}$`))
          : createDebug.names.push(new RegExp(`^${name}$`))
      })

    createDebug.instances.forEach(instance => {
      instance.enabled = createDebug.enabler(instance.namespace)
    })
  },

  /**
   * Returns true if the given mode name is enabled, false otherwise.
   *
   * @param {String} namespace
   * @return {Boolean}
   * @api public
   */
  enabler (namespace) {
    // FIXME: 'something*' would pass the check, what's this for?
    if (namespace[namespace.length - 1] === '*') return true

    if (createDebug.skips.some(regex => regex.test(namespace))) return false
    if (createDebug.names.some(regex => regex.test(namespace))) return true

    return false
  },

  /**
   * Select a color.
   *
   * @param {String} namespace
   * @return {Number}
   * @api private
   */
  selectColor (namespace) {
    let hash = 0
    for (let i in namespace) {
      hash = (hash << 5) - hash + namespace.charCodeAt(i)
      hash |= 0 // Convert to 32bit integer
    }
    return createDebug.colors[Math.abs(hash) % createDebug.colors.length]
  }
})
