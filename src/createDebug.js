import newInstance from './debug'

export default function () {
  return function createDebug (namespace) {
    const newDebug = Object.assign(newInstance(createDebug), {
      namespace,
      enabled: createDebug.enabler(namespace),
      useColors: createDebug.useColors(),
      color: createDebug.selectColor(namespace),
      destroy: () => {
        const index = createDebug.instances.indexOf(newDebug)
        if (index !== -1) {
          createDebug.instances.splice(index, 1)
          return true
        }
        return false
      },
      extend (namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter !== 'undefined' ? delimiter : ':') + namespace)
        newDebug.log = this.log
        return newDebug
      }
    })

    createDebug.instances.push(newDebug)

    return newDebug
  }
}
