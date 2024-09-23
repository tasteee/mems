export type MemsOptionsT = {
	maxCacheSize?: number
	shouldDeepCompareArgs?: boolean
}

export type FilledMemsOptionsT = Required<MemsOptionsT>
