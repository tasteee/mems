import { createFunctionsCache, createResultsCache, createArgumentsCache } from './caches'
import { MemsOptionsT } from './types'
const functionsCache = createFunctionsCache()

const fillOptions = (options: MemsOptionsT) => {
	const shouldDeepCompareArgs = options?.shouldDeepCompareArgs ?? false
	const maxCacheSize = options?.maxCacheSize ?? 1000

	return {
		shouldDeepCompareArgs,
		maxCacheSize
	}
}

export const mems = (target: Function, _options: MemsOptionsT) => {
	const cachedMemorizer = functionsCache.getMemorizer(target)
	if (cachedMemorizer) return cachedMemorizer

	const options = fillOptions(_options)
	const resultsCache = createResultsCache(options)
	const argsCache = createArgumentsCache(options)

	const memorizer = (...args: any[]) => {
		const matchedCacheArgs = argsCache.matchArgs(args)
		if (matchedCacheArgs) return resultsCache.getResult(matchedCacheArgs)
		const result = target(...args)
		argsCache.addArgs(args)
		resultsCache.addResult(args, result)
		return result
	}

	functionsCache.addMemorizer(target, memorizer)
	return memorizer
}

export const deepMems = (fn: Function) => {
	return mems(fn, { shouldDeepCompareArgs: true })
}
