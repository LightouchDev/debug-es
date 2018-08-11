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
      }
    })

    createDebug.instances.push(newDebug)

    return newDebug
  }
}
