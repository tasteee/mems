import { shallowEqual, deepEqual } from 'fast-equals'
import { FilledMemsOptionsT } from './types'

// Create a cache for all arguments sets provided to the function in the past.
export const createArgumentsCache = (options: FilledMemsOptionsT) => {
	const checkIsEqual = options.shouldDeepCompareArgs ? deepEqual : shallowEqual
	const argsHistory: any[] = []

	const addArgs = (newArgs: any[]) => {
		argsHistory.push(newArgs)
	}

	const matchArgs = (newArgs: any[]) => {
		for (const oldArgs of argsHistory) if (checkIsEqual(oldArgs, newArgs)) return oldArgs
		return null
	}

	return {
		addArgs,
		matchArgs
	}
}

const createArgumentKey = (args: any[]): string => {
	return JSON.stringify(args)
}

export const createResultsCache = (options: FilledMemsOptionsT) => {
	const results = new Map<string, any>()
	const keyOrder: string[] = []

	const addResult = (args: any[], result: any) => {
		const key = createArgumentKey(args)
		const isCacheExceeded = results.size >= options.maxCacheSize

		if (isCacheExceeded) {
			const oldestKey = keyOrder.shift()
			if (oldestKey) results.delete(oldestKey)
		}

		results.set(key, result)
		keyOrder.push(key)
	}

	const getResult = (args: any[]): any | undefined => {
		const key = createArgumentKey(args)
		return results.get(key)
	}

	const removeResult = (args: any[]): boolean => {
		const key = createArgumentKey(args)
		const index = keyOrder.indexOf(key)
		if (index > -1) keyOrder.splice(index, 1)
		return results.delete(key)
	}

	return {
		addResult,
		getResult,
		removeResult,

		get size() {
			return results.size
		}
	}
}

// Create global store for mapping functions to their memorizers.
export const createFunctionsCache = () => {
	const functions = new WeakMap<Function, Function>()

	const addMemorizer = (target: Function, memorizer: Function) => {
		functions.set(target, memorizer)
	}

	const getMemorizer = (target: Function) => {
		return functions.get(target)
	}

	return {
		addMemorizer,
		getMemorizer
	}
}
