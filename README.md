![mems](/logo.jpg)

# mems

A lightweight, flexible memoization library for JavaScript and TypeScript.

## Installation

```bash
npm install mems
```

or

```bash
yarn add mems
```

## Usage

You can use `mems` as a default import or named import:

```javascript
import mems from 'mems'
// or
import { mems } from 'mems'
```

### Basic Usage

```javascript
import mems from 'mems'

const expensiveFunction = (a, b) => {
	console.log('Calculating...')
	return a + b
}

const memoizedFunction = mems(expensiveFunction)

console.log(memoizedFunction(2, 3)) // Output: Calculating... 5
console.log(memoizedFunction(2, 3)) // Output: 5 (cached result)
```

### With Options

```javascript
import { mems } from 'mems'

const complexFunction = (obj) => {
	console.log('Processing...')
	return Object.keys(obj).length
}

const memoizedComplexFunction = mems(complexFunction, {
	maxCacheSize: 100,
	shouldDeepCompareArgs: true
})

console.log(memoizedComplexFunction({ a: 1, b: 2 })) // Output: Processing... 2
console.log(memoizedComplexFunction({ b: 2, a: 1 })) // Output: 2 (cached result)
```

### Deep Memoization

For convenience, `mems` also exports a `deepMems` function that uses deep comparison by default:

```javascript
import { deepMems } from 'mems'

const deepMemoizedFunction = deepMems(complexFunction)
```

## API

### mems(function, options?)

Memoizes the given function.

- `function`: The function to memoize.
- `options` (optional): An object with the following properties:
  - `maxCacheSize` (number, default: 1000): Maximum number of results to cache.
  - `shouldDeepCompareArgs` (boolean, default: false): Whether to use deep comparison for arguments.

Returns a memoized version of the function.

### deepMems(function)

Memoizes the given function using deep comparison for arguments.

## Features

- Lightweight and fast
- Configurable cache size
- Optional deep comparison of arguments
- TypeScript support
- No dependencies

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
