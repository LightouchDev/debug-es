'use strict'

module.exports = function (createDebug) {
  return function debug () {
    if (!debug.enabled) return

    const args = Array.from(arguments)

    // set 'diff' timestamp
    const { time } = debug
    const now = +new Date() // convert to number immediately
    debug._diff = now - (time.now || now)
    time.prev = time.now
    time.now = now

    args[0] = createDebug.coerce(args[0])

    // anything else let's inspect with %O
    typeof args[0] !== 'string' && args.unshift('%O')

    // apply 'formatters' transformations
    let index = 0
    args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match

      index++
      const formatter = createDebug.formatters[format]
      if (typeof formatter === 'function') {
        const value = args[index]
        match = formatter.call(debug, value)

        // now we need to remove 'args[index]' since it's inlined
        args.splice(index, 1)
        index--
      }

      return match
    })

    // apply env-specific formatting (colors, etc.)
    createDebug.formatArgs.call(debug, args)

    // output to log()
    ;(debug.log || createDebug.log).apply(debug, args)
  }
}
