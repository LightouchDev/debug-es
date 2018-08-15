import common from './common'
import createDebug from './createDebug'

const instance = {}

/**
 * Generate debug instance
 *
 * @param {Function} inject inject function for new instance
 * @param {String} namespace the instance namespace
 * @api private
 */
export default (inject, namespace) => {
  if (instance[namespace]) return instance[namespace]
  const debug = createDebug()
  Object.assign(debug, common(debug), inject(debug))
  debug.enable(debug.load())
  if (namespace) instance[namespace] = debug
  return debug
}
