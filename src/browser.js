import common from './common'
import createDebug from './createDebug'
import inject from './injector/browser'

const debug = createDebug()

export default Object.assign(debug, common(debug), inject(debug))

debug.enable(debug.load())
