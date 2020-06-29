/**
 * Test case for node environment
 */
const env = 'node'

const commonTest = require('./common')
const { modulePath, setWildcard } = commonTest

commonTest(env, tests)

function tests () {
  test('detect environment', () => {
      const debug = require(modulePath)
      expect(debug.inspectOpts).toBeTruthy()
    })

  describe('colors', () => {
    test('basic color support', () => {
      try {
        const supportColor = require('supports-color')
        Object.keys(supportColor).forEach(key => { delete supportColor[key] })
        Object.defineProperty(supportColor, 'stderr', {
          get () { throw new Error('fake error') }
        })
      } catch (error) {}

      expect(require(modulePath).colors).toHaveLength(6)
    })

    test('256-color support', () => {
      if (process.env.CI) {
        process.env.FORCE_COLOR = 1
        const supportsColor = require('supports-color')
        supportsColor.stderr.has256 = true
      }
      expect(require(modulePath).colors).toHaveLength(76)
    })
  })

  describe('formatters', () => {
    // FIXME: better tests required
    process.env.DEBUG = '*'
    const debug = require(modulePath)

    test('%o fomatter', () => {
      expect(() => debug.formatters.o(process.versions)).not.toThrow()
    })
    test('%O fomatter', () => {
      expect(() => debug.formatters.O(process.versions)).not.toThrow()
    })
  })

  test('inspectOpts', () => {
    process.env.DEBUG_COLORS = 'no'
    process.env.DEBUG_DEPTH = 10
    process.env.DEBUG_SHOW_HIDDEN = 'enabled'
    process.env.DEBUG_SHOW_PROXY = 'null'

    const result = {
      colors: false,
      depth: 10,
      showHidden: true,
      showProxy: null
    }

    expect(require(modulePath).inspectOpts).toEqual(result)
  })

  describe('formatArgs', () => {
    beforeEach(() => setWildcard(env))

    test('color output: on', () => {
      if (process.env.CI) {
        process.env.FORCE_COLOR = 1
        const supportsColor = require('supports-color')
        supportsColor.stderr.has256 = true
      }
      const debug = require(modulePath)
      const info = debug('info')
      const color = 166
      info.log = jest.fn()
      info('%%this is message%%')
      expect(info.log).toHaveBeenCalledWith(`  \u001b[38;5;${color};1minfo \u001b[0m%%this is message%%`, `\u001b[38;5;${color}m+0ms\u001b[0m`)
    })

    test('color output: on, basic color support', () => {
      const debug = require(modulePath)
      const info = debug('info')
      const color = 6
      info.color = color
      info.log = jest.fn()
      info('%%this is message%%')
      expect(info.log).toHaveBeenCalledWith(`  \u001b[3${color};1minfo \u001b[0m%%this is message%%`, `\u001b[3${color}m+0ms\u001b[0m`)
    })

    test('color output: off', () => {
      const debug = require(modulePath)
      const info = debug('info')
      info.log = jest.fn()
      info.useColors = false
      info('%%this is message%%')
      expect(info.log.mock.calls[0][0]).toMatch(/\w+ info %%this is message%%/)
    })

    test('color output: off, and hideDate', () => {
      process.env.DEBUG_HIDE_DATE = 'on'
      const debug = require(modulePath)
      const info = debug('info')
      info.log = jest.fn()
      info.useColors = false
      info('%%this is message%%')
      expect(info.log).toHaveBeenCalledWith('info %%this is message%%')
    })
  })

  test('load', () => {
    const namespaces = 'test, -dummy, worker:*'
    process.env.DEBUG = namespaces

    expect(require(modulePath).load()).toBe(namespaces)
  })

  describe('save', () => {
    const namespaces = 'test, -dummy, worker:*'

    test('null namespaces', () => {
      process.env.DEBUG = namespaces
      const debug = require(modulePath)
      debug.save()
      expect(debug.load()).toBeUndefined()
    })

    test('valid namespaces', () => {
      const debug = require(modulePath)
      debug.save(namespaces)
      expect(debug.load()).toBe(namespaces)
    })
  })

  describe('useColors', () => {
    test('inspectOpts.colors === true', () => {
      process.env.DEBUG_COLORS = 'on'
      expect(require(modulePath).useColors()).toBe(true)
    })

    test('inspectOpts.colors === false', () => {
      process.env.DEBUG_COLORS = 'off'
      expect(require(modulePath).useColors()).toBe(false)
    })

    test('inspectOpts.colors === undefined', () => {
      expect(require(modulePath).useColors()).toBe(true)
    })

    test('inspectOpts.colors === undefined, tty.isatty() === false', () => {
      const tty = require('tty')
      tty.isatty = jest.fn()
      tty.isatty.mockReturnValue(false)
      expect(require(modulePath).useColors()).toBe(false)
    })
  })
}
