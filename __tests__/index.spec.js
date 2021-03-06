import {
    addToGlobalConsole,
    logs,
    logk,
    logOptions,
    setLogOptions,
    logOptionsDefault,
    addLogOptions,
    resetLogOptions,
} from '../src'
import { inspect } from 'util'
import { noop } from '../src/utils'
import { fixtures } from '../__fixtures__'

const pf = arg => inspect(arg, logOptions())

beforeAll(() => {
    // convenience to debug the functions while console.log is mocked
    console.log2 = console.log
    jest.spyOn(global.console, 'log').mockImplementation(() => {})
})

beforeEach(() => {
    for (const fn of ['logk', 'logs']) {
        if (console[fn]) {
            console[fn] = undefined
        }
    }
    resetLogOptions()
})

describe('logs', () => {
    it('doesnt do anything if has no arguments', () => {
        logs()
        expect(console.log).not.toHaveBeenCalled()
    })
    it('format output prettily', () => {
        const input = fixtures[0]
        logs(input)
        expect(console.log).toHaveBeenCalledWith('console.logs', pf(input))
    })
    it('passes strings thru', () => {
        const input = 'input'
        logs(input)
        expect(console.log).toHaveBeenCalledWith('console.logs', input)
    })
    it('strings and object case', () => {
        logs('input', { foo: 2 })
        expect(console.log).toHaveBeenNthCalledWith(1, 'console.logs', 'input')
        expect(console.log).toHaveBeenNthCalledWith(2, 'console.logs', pf({ foo: 2 }))
    })
    it('strings and object case, many params', () => {
        logs('input', { foo: 2 }, 'bar', { baz: { bin: 33, gor: false } }, 'melt', 'pelt', {})
        expect(console.log).toHaveBeenNthCalledWith(1, 'console.logs', 'input')
        expect(console.log).toHaveBeenNthCalledWith(2, 'console.logs', pf({ foo: 2 }))
        expect(console.log).toHaveBeenNthCalledWith(3, 'console.logs', 'bar')
        expect(console.log).toHaveBeenNthCalledWith(4, 'console.logs', pf({ baz: { bin: 33, gor: false } }))
        expect(console.log).toHaveBeenNthCalledWith(5, 'console.logs', 'melt')
        expect(console.log).toHaveBeenNthCalledWith(6, 'console.logs', 'pelt')
        expect(console.log).toHaveBeenNthCalledWith(7, 'console.logs', pf({}))
    })
})

describe('logk', () => {
    it('doesnt do anything if has no arguments', () => {
        logk()
        expect(console.log).not.toHaveBeenCalled()
    })
    it("logs object's keys", () => {
        logk(fixtures[0])
        expect(console.log).toHaveBeenCalledWith('console.logk', Object.keys(fixtures[0]))
    })
    it('catches errors', () => {
        logk(null)
        expect(console.log).toHaveBeenCalledWith(
            'console.logk',
            new TypeError('Cannot convert undefined or null to object'),
        )
    })
})

describe('addToGlobalConsole', () => {
    it('addToGlobalConsole adds functions to console', () => {
        addToGlobalConsole()
        expect(console.logk).toBe(logk)
        expect(console.logs).toBe(logs)
    })
    it('addToGlobalConsole isProd argument false', () => {
        addToGlobalConsole(false)
        expect(console.logk).toBe(logk)
        expect(console.logs).toBe(logs)
    })
    it('addToGlobalConsole isProd argument true', () => {
        addToGlobalConsole(true)
        expect(console.logk).toBe(noop)
        expect(console.logs).toBe(noop)
    })
})

describe('setLogOptions', () => {
    it('setLogOptions', () => {
        const newOptions = setLogOptions({ compact: true })
        logs(fixtures[0])
        expect(console.log).toHaveBeenCalledWith('console.logs', inspect(fixtures[0], newOptions))
        expect(newOptions).toEqual({
            compact: true,
        })
    })
    it('addLogOptions', () => {
        const newOptions = addLogOptions({ compact: true })
        logs(fixtures[0])
        expect(console.log).toHaveBeenCalledWith('console.logs', inspect(fixtures[0], newOptions))
        expect(newOptions).toEqual({
            ...logOptionsDefault(),
            compact: true,
        })
    })
    it('resetLogOptions', () => {
        addLogOptions({ compact: true })
        resetLogOptions()
        expect(logOptions()).toEqual(logOptionsDefault())
    })
})
