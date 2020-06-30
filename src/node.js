import common from './common'
import createDebug from './createDebug'
import inject from './injector/node'

const debug = createDebug()

export default Object.assign(debug, common(debug), inject(debug))

debug.enable(debug.load())
