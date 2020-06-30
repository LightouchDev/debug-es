import common from './common'
import createDebug from './createDebug'
import browser from './injector/browser'
import node from './injector/node'

const debug = createDebug()

/**
 * Detect environment
 */
const inject =
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

export default Object.assign(debug, common(debug), inject(debug))

debug.enable(debug.load())
