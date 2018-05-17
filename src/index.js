'use strict'

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
    ? require('./browser.js')
    : require('./node.js')

module.exports = require('./common')(env)
