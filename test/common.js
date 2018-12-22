/* eslint-disable no-console */

const modulePath = '../src'

function resetEnv (env) {
  jest.resetModules()

  if (env === 'browser') {
    window.localStorage && window.localStorage.removeItem('debug')
  }

  if (env === 'node') {
    Object.keys(process.env)
      .filter(key => /^debug_/i.test(key))
      .forEach(key => delete process.env[key])

    if (process.env.CI) {
      const tty = require('tty')
      tty.isatty = jest.fn()
      tty.isatty.mockReturnValue(true)
    }
  }
  delete process.env.DEBUG
}

function setWildcard (env) {
  env === 'browser' && window.localStorage.setItem('debug', '*')
  env === 'node' && (process.env.DEBUG = '*')
}

module.exports = (env, tests) => {
  beforeEach(() => resetEnv(env))

  describe(`common test in ${env}`, () => {
    describe('common.js', () => {
      describe('coerce: handle Error messages', () => {
        const debug = require(modulePath)
        const message = 'this is message'

        test('Error object', () => {
          const err = new Error(message)
          expect(debug.coerce(err)).toBe(err.stack)
        })
        test('Error object without .stack', () => {
          const err = new Error(message)
          delete err.stack
          expect(debug.coerce(err)).toBe(err.message)
        })
        test('plain strings', () => {
          expect(debug.coerce(message)).toBe(message)
        })
      })

      test('disable: turn off all instances', () => {
        const debug = require(modulePath)
        debug.disable()
        expect(debug.skips).toHaveLength(0)
        expect(debug.names).toHaveLength(0)

        expect(debug.instances.some(instance => instance.enabled)).toBeFalsy()
      })

      describe('enable', () => {
        function instancesCalc (debug) {
          let truthy = 0
          let falsy = 0
          debug.instances.forEach(instance => instance.enabled ? truthy++ : falsy++)
          return { falsy, truthy }
        }

        test('turn on instances by namespaces', () => {
          const debug = require(modulePath)
          debug('test')
          debug('dummy')
          debug('worker:a')
          debug('worker:b')

          const namespaces = 'test, -dummy, worker:*'
          debug.enable(namespaces)

          expect(debug.load()).toBe(namespaces)

          expect(debug.names).toHaveLength(2)
          expect(debug.names.map(regex => regex.toString())).toEqual(['/^test$/', '/^worker:.*?$/'])

          expect(debug.skips).toHaveLength(1)
          expect(debug.skips.map(regex => regex.toString())).toEqual(['/^dummy$/'])

          expect(instancesCalc(debug)).toEqual({ falsy: 1, truthy: 3 })
        })

        test('wildcard with some skip names', () => {
          const debug = require(modulePath)
          debug('test')
          debug('dummy')
          debug('worker:a')
          debug('worker:b')
          debug('nickname')
          debug.enable('*, -dummy, -*name')

          expect(debug.names).toHaveLength(1)
          expect(debug.skips).toHaveLength(2)
          expect(instancesCalc(debug)).toEqual({ falsy: 2, truthy: 3 })
        })

        test('non-string namespaces', () => {
          const debug = require(modulePath)
          expect(() => debug.enable(true)).not.toThrow()
        })
      })

      test('enabler: check namespace enabled', () => {
        const debug = require(modulePath)

        expect(debug.enabler('')).toBe(false)
        expect(debug.enabler('name*')).toBe(true)

        debug.enable('test, -dummy, worker:*')
        expect(debug.enabler('test')).toBe(true)
        expect(debug.enabler('test123')).toBe(false)
        expect(debug.enabler('dummy')).toBe(false)
        expect(debug.enabler('worker:a')).toBe(true)
        expect(debug.enabler('worker:b')).toBe(true)
        expect(debug.enabler('work:a')).toBe(false)
      })

      describe('extend', () => {
        let log
        beforeEach(() => {
          const debug = require(modulePath)
          debug.enable('foo')
          log = debug('foo')
        })

        test('should extend namespace', () => {
          const logBar = log.extend('bar')
          expect(logBar.namespace).toEqual('foo:bar')
        })

        test('should extend namespace with custom delimiter', () => {
          const logBar = log.extend('bar', '--')
          expect(logBar.namespace).toEqual('foo--bar')
        })

        test('should extend namespace with empty delimiter', () => {
          const logBar = log.extend('bar', '')
          expect(logBar.namespace).toEqual('foobar')
        })
        test('should keep the log function between extensions', () => {
          log.log = () => {}

          const logBar = log.extend('bar')
          expect(log.log).toStrictEqual(logBar.log)
        })
      })
    })

    describe('debug.js', () => {
      beforeEach(() => setWildcard(env))

      test('debug is disabled', () => {
        resetEnv(env)
        const debug = require(modulePath)
        debug.log = jest.fn()
        const info = debug('info')
        info('this is disabled')

        expect(debug.log).not.toBeCalled()
      })

      describe('formatter', () => {
        test('% escape', () => {
          const debug = require(modulePath)
          debug.formatArgs = jest.fn()
          debug.log = () => {}

          const message = '%% message %%'
          const info = debug('info')
          info(message)

          expect(debug.formatArgs).toHaveBeenCalledWith([message])
        })

        test('custom formatter', () => {
          const debug = require(modulePath)
          debug.formatArgs = jest.fn()
          debug.log = () => {}
          debug.formatters.z = value => value.toUpperCase()

          const info = debug('info')
          info('%% %z %%', 'message')

          expect(debug.formatArgs).toHaveBeenCalledWith(['%% MESSAGE %%'])
        })
      })

      describe('log function', () => {
        test('default log()', () => {
          const debug = require(modulePath)
          debug.log = jest.fn()

          const info = debug('test')
          info('this is a message')

          expect(info.log).toBeFalsy()
          expect(debug.log).toHaveBeenCalled()
        })

        test('custom log()', () => {
          const debug = require(modulePath)

          const info = debug('test')
          info.log = jest.fn()
          info('this is a message')

          expect(info.log).toHaveBeenCalled()
        })
      })

      describe('destroy', () => {
        test('destroy instance', () => {
          const debug = require(modulePath)
          debug('test')
          const info = debug('info')

          expect(debug.instances).toHaveLength(2)
          expect(debug.instances.indexOf(info)).toBeGreaterThan(-1)

          expect(info.destroy()).toBe(true)
          expect(debug.instances).toHaveLength(1)
          expect(debug.instances.indexOf(info)).toBe(-1)
        })

        test('destroy instance that not in instances array', () => {
          const debug = require(modulePath)
          const info = debug('info')
          info.enabled = false

          debug.enable('*')
          expect(info.enabled).toBe(true)

          // clear array
          debug.instances.length = 0
          expect(debug.instances.indexOf(info)).toBe(-1)

          info.enabled = false
          expect(info.destroy()).toBe(false)

          debug.enable('*')
          expect(info.enabled).toBe(false)
        })
      })
    })

    describe('init function', () => {
      test(`init of ${env}`, () => {
        const init = require(`${modulePath}/${env}`)
        const firstInstance = init()
        expect(init()).toEqual(firstInstance)
      })

      test('init without namespace', () => {
        const init = require(`${modulePath}/init`)
        const noop = () => {}
        const mockFuncs = ({
          enable: noop,
          load: noop
        })
        const firstInstance = init(() => mockFuncs)
        expect(init(() => mockFuncs) === firstInstance).toBeFalsy()
      })
    })

    test('basic sanity check', () => {
      const debug = require(modulePath)
      const info = debug('info')
      info.enabled = true
      expect(() => info('hello world')).not.toThrow()
      expect(() => info({})).not.toThrow()
    })
  })

  tests && describe(`${env}-specific tests`, tests)
}

Object.assign(module.exports, {
  modulePath,
  resetEnv,
  setWildcard
})
