/**
 * Test case for node environment
 */
const env = 'node'

const commonTest = require('./common')
const { setWildcard } = commonTest

commonTest(env, tests)

function tests () {
  test('detect environment', () => {
    const debug = require('../src')
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

      expect(require('../src').colors).toHaveLength(6)
    })

    test('256-color support', () => {
      expect(require('../src').colors).toHaveLength(76)
    })
  })

  describe('formatters', () => {
    // FIXME: better tests required
    process.env.DEBUG = '*'
    const debug = require('../src')

    test('%o fomatter', () => {
      expect(() => debug.formatters.o(process.versions)).not.toThrow()
    })
    test('%O fomatter', () => {
      expect(() => debug.formatters.O(process.versions)).not.toThrow()
    })
  })

  test('inspectOpts', () => {
    process.env['DEBUG_COLORS'] = 'no'
    process.env['DEBUG_DEPTH'] = 10
    process.env['DEBUG_SHOW_HIDDEN'] = 'enabled'
    process.env['DEBUG_SHOW_PROXY'] = 'null'

    const result = {
      colors: false,
      depth: 10,
      showHidden: true,
      showProxy: null
    }

    expect(require('../src').inspectOpts).toEqual(result)
  })

  test('init', () => {
    process.env['DEBUG_COLORS'] = 'no'
    process.env['DEBUG_DEPTH'] = 10
    process.env['DEBUG_SHOW_HIDDEN'] = 'enabled'

    const result = {
      colors: false,
      depth: 10,
      showHidden: true
    }

    const debug = require('../src')
    const answer = {}
    debug.init(answer)

    expect(answer.inspectOpts).toEqual(result)
  })

  describe('formatArgs', () => {
    beforeEach(() => setWildcard(env))

    test('color output: on', () => {
      const debug = require('../src')
      const info = debug('info')
      const color = 166
      info.log = jest.fn()
      info('%%this is message%%')
      expect(info.log).toBeCalledWith(`  \u001b[38;5;${color};1minfo \u001b[0m%%this is message%%`, `\u001b[38;5;${color}m+0ms\u001b[0m`)
    })

    test('color output: on, basic color support', () => {
      const debug = require('../src')
      const info = debug('info')
      const color = 6
      info.color = color
      info.log = jest.fn()
      info('%%this is message%%')
      expect(info.log).toBeCalledWith(`  \u001b[3${color};1minfo \u001b[0m%%this is message%%`, `\u001b[3${color}m+0ms\u001b[0m`)
    })

    test('color output: off', () => {
      const debug = require('../src')
      const info = debug('info')
      info.log = jest.fn()
      info.useColors = false
      info('%%this is message%%')
      expect(info.log.mock.calls[0][0]).toMatch(/\w+ info %%this is message%%/)
    })

    test('color output: off, and hideDate', () => {
      process.env['DEBUG_HIDE_DATE'] = 'on'
      const debug = require('../src')
      const info = debug('info')
      info.log = jest.fn()
      info.useColors = false
      info('%%this is message%%')
      expect(info.log).toBeCalledWith('info %%this is message%%')
    })
  })

  test('load', () => {
    const namespaces = 'test, -dummy, worker:*'
    process.env.DEBUG = namespaces

    expect(require('../src/node').load()).toBe(namespaces)
  })

  describe('save', () => {
    const namespaces = 'test, -dummy, worker:*'

    test('null namespaces', () => {
      process.env.DEBUG = namespaces
      const node = require('../src/node')
      node.save()
      expect(node.load()).toBeUndefined()
    })

    test('valid namespaces', () => {
      const node = require('../src/node')
      node.save(namespaces)
      expect(node.load()).toBe(namespaces)
    })
  })

  describe('useColors', () => {
    test('inspectOpts.colors === true', () => {
      process.env['DEBUG_COLORS'] = 'on'
      expect(require('../src/node').useColors()).toBe(true)
    })

    test('inspectOpts.colors === false', () => {
      process.env['DEBUG_COLORS'] = 'off'
      expect(require('../src/node').useColors()).toBe(false)
    })

    test('inspectOpts.colors === undefined', () => {
      expect(require('../src/node').useColors()).toBe(true)
    })

    test('inspectOpts.colors === undefined, tty.isatty() === false', () => {
      const tty = require('tty')
      tty.isatty = jest.fn()
      tty.isatty.mockReturnValue(false)
      expect(require('../src/node').useColors()).toBe(false)
    })
  })
}
