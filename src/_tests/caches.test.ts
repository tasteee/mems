import { describe, it, expect, vi } from 'vitest'
import { createArgumentsCache, createResultsCache, createFunctionsCache } from './memoization'
import { FilledMemsOptionsT } from './types'

describe('createArgumentsCache', () => {
  const defaultOptions: FilledMemsOptionsT = {
    maxCacheSize: 100,
    shouldDeepCompareArgs: false
  }

  it('should add and match arguments with shallow equality', () => {
    const argsCache = createArgumentsCache(defaultOptions)
    const args = [1, { a: 1 }, [2]]

    argsCache.addArgs(args)
    const matchedArgs = argsCache.matchArgs(args)

    expect(matchedArgs).toEqual(args)
  })

  it('should not match different arguments with shallow equality', () => {
    const argsCache = createArgumentsCache(defaultOptions)
    const args1 = [1, { a: 1 }, [2]]
    const args2 = [1, { a: 1 }, [2]]

    argsCache.addArgs(args1)
    const matchedArgs = argsCache.matchArgs(args2)

    expect(matchedArgs).toBeNull()
  })

  it('should match different but deeply equal arguments when using deep comparison', () => {
    const argsCache = createArgumentsCache({ ...defaultOptions, shouldDeepCompareArgs: true })
    const args1 = [1, { a: 1 }, [2]]
    const args2 = [1, { a: 1 }, [2]]

    argsCache.addArgs(args1)
    const matchedArgs = argsCache.matchArgs(args2)

    expect(matchedArgs).toEqual(args1)
  })
})

describe('createResultsCache', () => {
  const defaultOptions: FilledMemsOptionsT = {
    maxCacheSize: 3,
    shouldDeepCompareArgs: false
  }

  it('should add and retrieve results', () => {
    const resultsCache = createResultsCache(defaultOptions)
    const args = [1, 2, 3]
    const result = 6

    resultsCache.addResult(args, result)
    const retrievedResult = resultsCache.getResult(args)

    expect(retrievedResult).toBe(result)
  })

  it('should respect maxCacheSize', () => {
    const resultsCache = createResultsCache(defaultOptions)
    
    resultsCache.addResult([1], 1)
    resultsCache.addResult([2], 2)
    resultsCache.addResult([3], 3)
    resultsCache.addResult([4], 4)

    expect(resultsCache.size).toBe(3)
    expect(resultsCache.getResult([1])).toBeUndefined()
    expect(resultsCache.getResult([4])).toBe(4)
  })

  it('should remove results', () => {
    const resultsCache = createResultsCache(defaultOptions)
    const args = [1, 2, 3]
    
    resultsCache.addResult(args, 6)
    expect(resultsCache.getResult(args)).toBe(6)

    resultsCache.removeResult(args)
    expect(resultsCache.getResult(args)).toBeUndefined()
  })
})

describe('createFunctionsCache', () => {
  it('should add and retrieve memorizers', () => {
    const functionsCache = createFunctionsCache()
    const targetFn = (a: number, b: number) => a + b
    const memorizerFn = vi.fn()

    functionsCache.addMemorizer(targetFn, memorizerFn)
    const retrievedMemorizer = functionsCache.getMemorizer(targetFn)

    expect(retrievedMemorizer).toBe(memorizerFn)
  })

  it('should return undefined for non-existent memorizers', () => {
    const functionsCache = createFunctionsCache()
    const targetFn = (a: number, b: number) => a + b

    const retrievedMemorizer = functionsCache.getMemorizer(targetFn)

    expect(retrievedMemorizer).toBeUndefined()
  })
})

describe('Integration tests', () => {
  const defaultOptions: FilledMemsOptionsT = {
    maxCacheSize: 100,
    shouldDeepCompareArgs: false
  }

  it('should correctly memoize function results', () => {
    const argsCache = createArgumentsCache(defaultOptions)
    const resultsCache = createResultsCache(defaultOptions)
    const functionsCache = createFunctionsCache()

    const expensiveFunction = vi.fn((a: number, b: number) => a + b)

    const memoizedFunction = (...args: any[]) => {
      const cachedArgs = argsCache.matchArgs(args)
      if (cachedArgs) {
        return resultsCache.getResult(cachedArgs)
      }

      const result = expensiveFunction(...args)
      argsCache.addArgs(args)
      resultsCache.addResult(args, result)
      return result
    }

    functionsCache.addMemorizer(expensiveFunction, memoizedFunction)

    // First call
    expect(memoizedFunction(1, 2)).toBe(3)
    expect(expensiveFunction).toHaveBeenCalledTimes(1)

    // Second call with same arguments
    expect(memoizedFunction(1, 2)).toBe(3)
    expect(expensiveFunction).toHaveBeenCalledTimes(1)

    // Call with different arguments
    expect(memoizedFunction(2, 3)).toBe(5)
    expect(expensiveFunction).toHaveBeenCalledTimes(2)
  })

  it('should respect maxCacheSize in integration', () => {
    const options: FilledMemsOptionsT = { ...defaultOptions, maxCacheSize: 2 }
    const argsCache = createArgumentsCache(options)
    const resultsCache = createResultsCache(options)

    const expensiveFunction = vi.fn((a: number) => a * 2)

    const memoizedFunction = (arg: number) => {
      const args = [arg]
      const cachedArgs = argsCache.matchArgs(args)
      if (cachedArgs) {
        return resultsCache.getResult(cachedArgs)
      }

      const result = expensiveFunction(arg)
      argsCache.addArgs(args)
      resultsCache.addResult(args, result)
      return result
    }

    memoizedFunction(1)
    memoizedFunction(2)
    memoizedFunction(3)

    expect(resultsCache.size).toBe(2)
    expect(resultsCache.getResult([1])).toBeUndefined()
    expect(resultsCache.getResult([2])).toBe(4)
    expect(resultsCache.getResult([3])).toBe(6)
  })
})