import createDebug from './createDebug'

export default (inject) => {
  const debug = createDebug()
  Object.assign(debug, inject(debug))
  debug.enable(debug.load())
  return debug
}
