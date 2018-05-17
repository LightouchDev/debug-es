/**
 * Test case for browser environment
 */
const env = 'browser'
const process = global.process

process.browser = true

const localStorage = window.localStorage = window.sessionStorage = {
  getItem (key) {
    const value = this[key]
    return typeof value === 'undefined'
      ? null
      : value
  },
  setItem (key, value) {
    this[key] = value
  },
  removeItem (key) {
    return delete this[key]
  }
}

const commonTest = require('./common')
const { setWildcard } = commonTest
commonTest(env, tests)

function tests () {
  beforeEach(() => { window.localStorage = localStorage })

  describe('detect environment', () => {
    beforeEach(() => {
      global.process = process
      Object.assign(process, {
        type: undefined,
        __nwjs: undefined,
        browser: undefined
      })
    })

    afterAll(() => { process.browser = true })

    test(`browser: no global process object`, () => {
      global.process = undefined

      const debug = require('../src')
      global.process = process
      expect(debug).toHaveProperty('storage', expect.anything())
    })
    test(`Electron: process.type === 'renderer'`, () => {
      process.type = 'renderer'

      const debug = require('../src')
      expect(debug).toHaveProperty('storage', expect.anything())
    })
    test(`nwjs: process.__nwjs is truthy`, () => {
      process.__nwjs = 1

      const debug = require('../src')
      expect(debug).toHaveProperty('storage', expect.anything())
    })
    test(`'process' package support`, () => {
      process.browser = true

      const debug = require('../src')
      expect(debug).toHaveProperty('storage', expect.anything())
    })
  })

  describe('formatters', () => {
    describe('%j formatter', () => {
      const debug = require('../src')
      const { j: formatter } = debug.formatters

      // this test borrow from fast-json-stringify
      test('common object', () => {
        const obj = {
          stringProperty: 'string1',
          objectProperty: {
            stringProperty: 'string2',
            numberProperty: 42
          }
        }
        expect(formatter(obj))
          .toBe('{"stringProperty":"string1","objectProperty":{"stringProperty":"string2","numberProperty":42}}')
      })

      test('circular object', () => {
        const obj = {}
        obj.this = obj

        expect(formatter(obj)).toBe('{}')
      })

      test.skip('error handle', () => {
        // FIXME: it's hard to make stringify throw error
        const error = new Error('this is a fake error')
        const obj = {}
        Object.defineProperty(obj, 'error', {
          get () { throw error }
        })

        expect(formatter(obj)).toBe(`[UnexpectedJSONParseError]: ${error.message}`)
      })
    })
  })

  describe('storage', () => {
    test('localStorage exist', () => {
      const debug = require('../src')
      expect(debug.storage).toBe(localStorage)
    })

    test('localStorage not exist', () => {
      window.localStorage = undefined
      const debug = require('../src')
      expect(debug.storage).toBeUndefined()
    })
  })

  describe('formatArgs', () => {
    beforeEach(() => setWildcard(env))

    test('color output: on', () => {
      const debug = require('../src')
      const info = debug('info')
      info.log = jest.fn()
      info('%%this is message%%')
      expect(info.log).toBeCalledWith('%cinfo %c%%this is message%% %c+0ms', 'color: #CC3300', 'color: inherit', 'color: #CC3300')
    })

    test('color output: off', () => {
      const debug = require('../src')
      const info = debug('info')
      info.log = jest.fn()
      info.useColors = false
      info('%%this is message%%')
      expect(info.log).toBeCalledWith('info %%this is message%% +0ms')
    })

    test('custom color tag', () => {
      const debug = require('../src')
      const info = debug('info')
      info.log = jest.fn()
      info('%%this is %cmessage%%', 'color: #ff0000')
      expect(info.log).toBeCalledWith('%cinfo %c%%this is %cmessage%% %c+0ms', 'color: #CC3300', 'color: inherit', 'color: #ff0000', 'color: #CC3300')
    })
  })

  describe('load', () => {
    test('load from localStorage', () => {
      const namespaces = 'test, -dummy, worker:*'
      window.localStorage.setItem('debug', namespaces)

      const browser = require('../src/browser')
      expect(browser.load()).toBe(namespaces)
    })

    test('load from process.env', () => {
      const namespaces = 'test, -dummy, worker:*'
      process.env.DEBUG = namespaces
      expect(window.localStorage.getItem('debug')).toBeFalsy()

      const browser = require('../src/browser')
      expect(browser.load()).toBe(namespaces)
    })
  })

  describe('save', () => {
    const namespaces = 'test, -dummy, worker:*'

    test('null namespaces', () => {
      const browser = require('../src/browser')
      window.localStorage.setItem('debug', namespaces)
      browser.save()

      expect(browser.load()).toBeUndefined()
    })

    test('valid namespaces', () => {
      const browser = require('../src/browser')
      browser.save(namespaces)

      expect(browser.load()).toBe(namespaces)
    })
  })

  describe('useColors', () => {
    const ie11 = 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; rv:11.0) like Gecko'
    const edge = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; ServiceUI 11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299'
    const edgeOld = 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10136'
    const firefox = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0) Gecko/20100101 Firefox/61.0'
    const chrome = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.170 Safari/537.36'

    Object.defineProperty(navigator, 'userAgent', (_value => {
      return {
        get () {
          return _value
        },
        set (value) {
          _value = value
        }
      }
    })(navigator.userAgent))

    test('Electron/nwjs', () => {
      const debug = require('../src')
      process.type = 'renderer'
      expect(debug.useColors()).toBe(true)
      delete process.type

      process.__nwjs = 1
      expect(debug.useColors()).toBe(true)
      delete process.__nwjs
    })

    test('IE 11', () => {
      navigator.userAgent = ie11

      expect(require('../src').useColors()).toBe(false)
    })
    test('edge 12.10136', () => {
      navigator.userAgent = edgeOld

      expect(require('../src').useColors()).toBe(false)
    })
    test('edge 16.16299', () => {
      navigator.userAgent = edge

      expect(require('../src').useColors()).toBe(true)
    })
    test('firefox 61', () => {
      navigator.userAgent = firefox

      expect(require('../src').useColors()).toBe(true)
    })
    test('chrome 66', () => {
      navigator.userAgent = chrome

      expect(require('../src').useColors()).toBe(true)
    })
  })
}
