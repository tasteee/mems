import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mems, deepMems } from './memoization'
import * as caches from './caches'

// Mock the caches module
vi.mock('./caches', () => ({
	createFunctionsCache: vi.fn(),
	createResultsCache: vi.fn(),
	createArgumentsCache: vi.fn()
}))

describe('mems', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should memoize a function', () => {
		const mockFn = vi.fn((x: number) => x * 2)
		const memoizedFn = mems(mockFn, {})

		expect(memoizedFn(2)).toBe(4)
		expect(memoizedFn(2)).toBe(4)
		expect(mockFn).toHaveBeenCalledTimes(1)
	})

	it('should use functionsCache to retrieve existing memorizers', () => {
		const mockFn = vi.fn()
		const mockMemorizer = vi.fn()
		const mockGetMemorizer = vi.fn().mockReturnValue(mockMemorizer)
		vi.mocked(caches.createFunctionsCache).mockReturnValue({
			getMemorizer: mockGetMemorizer,
			addMemorizer: vi.fn()
		})

		const result = mems(mockFn, {})

		expect(mockGetMemorizer).toHaveBeenCalledWith(mockFn)
		expect(result).toBe(mockMemorizer)
	})

	it('should create new memorizer if not found in functionsCache', () => {
		const mockFn = vi.fn()
		const mockAddMemorizer = vi.fn()
		vi.mocked(caches.createFunctionsCache).mockReturnValue({
			getMemorizer: vi.fn().mockReturnValue(undefined),
			addMemorizer: mockAddMemorizer
		})
		vi.mocked(caches.createResultsCache).mockReturnValue({
			addResult: vi.fn(),
			getResult: vi.fn()
		})
		vi.mocked(caches.createArgumentsCache).mockReturnValue({
			addArgs: vi.fn(),
			matchArgs: vi.fn()
		})

		const result = mems(mockFn, {})

		expect(mockAddMemorizer).toHaveBeenCalledWith(mockFn, expect.any(Function))
		expect(result).toBeInstanceOf(Function)
	})

	it('should use provided options', () => {
		const mockFn = vi.fn()
		const options = { maxCacheSize: 500, shouldDeepCompareArgs: true }

		mems(mockFn, options)

		expect(caches.createResultsCache).toHaveBeenCalledWith(expect.objectContaining(options))
		expect(caches.createArgumentsCache).toHaveBeenCalledWith(expect.objectContaining(options))
	})

	it('should use default options when not provided', () => {
		const mockFn = vi.fn()

		mems(mockFn, {})

		expect(caches.createResultsCache).toHaveBeenCalledWith(
			expect.objectContaining({
				maxCacheSize: 1000,
				shouldDeepCompareArgs: false
			})
		)
		expect(caches.createArgumentsCache).toHaveBeenCalledWith(
			expect.objectContaining({
				maxCacheSize: 1000,
				shouldDeepCompareArgs: false
			})
		)
	})

	it('should return cached result if args match', () => {
		const mockFn = vi.fn()
		const mockMatchArgs = vi.fn().mockReturnValue([1, 2])
		const mockGetResult = vi.fn().mockReturnValue(3)
		vi.mocked(caches.createFunctionsCache).mockReturnValue({
			getMemorizer: vi.fn().mockReturnValue(undefined),
			addMemorizer: vi.fn()
		})
		vi.mocked(caches.createResultsCache).mockReturnValue({
			addResult: vi.fn(),
			getResult: mockGetResult
		})
		vi.mocked(caches.createArgumentsCache).mockReturnValue({
			addArgs: vi.fn(),
			matchArgs: mockMatchArgs
		})

		const memoizedFn = mems(mockFn, {})
		const result = memoizedFn(1, 2)

		expect(mockMatchArgs).toHaveBeenCalledWith([1, 2])
		expect(mockGetResult).toHaveBeenCalledWith([1, 2])
		expect(result).toBe(3)
		expect(mockFn).not.toHaveBeenCalled()
	})

	it("should call original function and cache result if args don't match", () => {
		const mockFn = vi.fn().mockReturnValue(3)
		const mockMatchArgs = vi.fn().mockReturnValue(null)
		const mockAddArgs = vi.fn()
		const mockAddResult = vi.fn()
		vi.mocked(caches.createFunctionsCache).mockReturnValue({
			getMemorizer: vi.fn().mockReturnValue(undefined),
			addMemorizer: vi.fn()
		})
		vi.mocked(caches.createResultsCache).mockReturnValue({
			addResult: mockAddResult,
			getResult: vi.fn()
		})
		vi.mocked(caches.createArgumentsCache).mockReturnValue({
			addArgs: mockAddArgs,
			matchArgs: mockMatchArgs
		})

		const memoizedFn = mems(mockFn, {})
		const result = memoizedFn(1, 2)

		expect(mockMatchArgs).toHaveBeenCalledWith([1, 2])
		expect(mockFn).toHaveBeenCalledWith(1, 2)
		expect(mockAddArgs).toHaveBeenCalledWith([1, 2])
		expect(mockAddResult).toHaveBeenCalledWith([1, 2], 3)
		expect(result).toBe(3)
	})
})

describe('deepMems', () => {
	it('should call mems with shouldDeepCompareArgs set to true', () => {
		const mockFn = vi.fn()
		const mockMems = vi.fn()
		vi.spyOn(global, 'mems').mockImplementation(mockMems)

		deepMems(mockFn)

		expect(mockMems).toHaveBeenCalledWith(mockFn, { shouldDeepCompareArgs: true })
	})
})
