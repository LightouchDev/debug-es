import browser from './browser'
import node from './node'

/**
 * Detect environment
 */
const debug =
  // web browsers
  typeof process === 'undefined' ||
  // Electron
  process.type === 'renderer' ||
  // nwjs
  process.__nwjs ||
  // 'process' package
  process.browser
    ? browser()
    : node()

export default debug
