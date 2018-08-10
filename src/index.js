import createDebug from './createDebug'
import browser from './browser'
import node from './node'

/**
 * Detect environment
 */
const env =
  // web browsers
  typeof process === 'undefined' ||
  // Electron
  process.type === 'renderer' ||
  // nwjs
  process.__nwjs ||
  // 'process' package
  process.browser
    ? browser
    : node

const debug = Object.assign(createDebug, env)
debug.enable(debug.load())

export default debug
