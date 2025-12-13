import type { Pointer } from './pointer';
import { hasOwnProperty } from './util';

export interface AddOperation { op: 'add'; path: string; value: any }
export interface RemoveOperation { op: 'remove'; path: string }
export interface ReplaceOperation { op: 'replace'; path: string; value: any }
export interface MoveOperation { op: 'move'; from: string; path: string }
export interface CopyOperation { op: 'copy'; from: string; path: string }
export interface TestOperation { op: 'test'; path: string; value: any }

export type Operation =
	| AddOperation
	| RemoveOperation
	| ReplaceOperation
	| MoveOperation
	| CopyOperation
	| TestOperation;

export function isDestructive({ op }: Operation): boolean {
	return op === 'remove' || op === 'replace' || op === 'copy' || op === 'move';
}

export type Diff = (input: any, output: any, ptr: Pointer) => Operation[];
export type VoidableDiff = (input: any, output: any, ptr: Pointer) => Operation[] | void;

export function subtract(minuend: { [index: string]: any }, subtrahend: { [index: string]: any }): string[] {
	// initialize empty object; we only care about the keys, the values can be anything
	const obj: { [index: string]: number } = {};
	// build up obj with all the properties of minuend
	for (const add_key in minuend) {
		if (hasOwnProperty.call(minuend, add_key) && minuend[add_key] !== undefined) {
			obj[add_key] = 1;
		}
	}
	// now delete all the properties of subtrahend from obj
	// (deleting a missing key has no effect)
	for (const del_key in subtrahend) {
		if (hasOwnProperty.call(subtrahend, del_key) && subtrahend[del_key] !== undefined) {
			delete obj[del_key];
		}
	}
	// finally, extract whatever keys remain in obj
	return Object.keys(obj);
}

export function intersection(objects: ArrayLike<{ [index: string]: any }>): string[] {
	const length = objects.length;
	// prepare empty counter to keep track of how many objects each key occurred in
	const counter: { [index: string]: number } = {};
	// go through each object and increment the counter for each key in that object
	for (let i = 0; i < length; i++) {
		const object = objects[i];
		for (const key in object) {
			if (hasOwnProperty.call(object, key) && object[key] !== undefined) {
				counter[key] = (counter[key] || 0) + 1;
			}
		}
	}
	// now delete all keys from the counter that were not seen in every object
	for (const key in counter) {
		if (counter[key] < length) {
			delete counter[key];
		}
	}
	// finally, extract whatever keys remain in the counter
	return Object.keys(counter);
}

interface ArrayAdd { op: 'add'; index: number; value: any }
interface ArrayRemove { op: 'remove'; index: number }
interface ArrayReplace { op: 'replace'; index: number; original: any; value: any }

type ArrayOperation = ArrayAdd | ArrayRemove | ArrayReplace;

function isArrayAdd(arrayOp: ArrayOperation): arrayOp is ArrayAdd {
	return arrayOp.op === 'add';
}

function isArrayRemove(arrayOp: ArrayOperation): arrayOp is ArrayRemove {
	return arrayOp.op === 'remove';
}

interface DynamicAlternative {
	operations: ArrayOperation[];
	cost: number;
}

function appendArrayOperation(base: DynamicAlternative, operation: ArrayOperation): DynamicAlternative {
	return {
		// the new operation must be pushed on the end
		operations: base.operations.concat(operation),
		cost: base.cost + 1,
	};
}

export function diffArrays<T>(input: T[], output: T[], ptr: Pointer, diff: Diff = diffAny): Operation[] {
	// set up cost matrix (very simple initialization: just a map)
	const memo: { [index: string]: DynamicAlternative } = {
		'0,0': { operations: [], cost: 0 },
	};

	function dist(i: number, j: number): DynamicAlternative {
		// memoized
		const memo_key = `${i},${j}`;
		let memoized = memo[memo_key];
		if (memoized === undefined) {
			// TODO: this !diff(...).length usage could/should be lazy
			if (i > 0 && j > 0 && !diff(input[i - 1], output[j - 1], ptr.add(String(i - 1))).length) {
				// equal (no operations => no cost)
				memoized = dist(i - 1, j - 1);
			} else {
				const alternatives: DynamicAlternative[] = [];
				if (i > 0) {
					// NOT topmost row
					const remove_base = dist(i - 1, j);
					const remove_operation: ArrayRemove = {
						op: 'remove',
						index: i - 1,
					};
					alternatives.push(appendArrayOperation(remove_base, remove_operation));
				}
				if (j > 0) {
					// NOT leftmost column
					const add_base = dist(i, j - 1);
					const add_operation: ArrayAdd = {
						op: 'add',
						index: i - 1,
						value: output[j - 1],
					};
					alternatives.push(appendArrayOperation(add_base, add_operation));
				}
				if (i > 0 && j > 0) {
					// TABLE MIDDLE
					// supposing we replaced it, compute the rest of the costs:
					const replace_base = dist(i - 1, j - 1);
					// okay, the general plan is to replace it, but we can be smarter,
					// recursing into the structure and replacing only part of it if
					// possible, but to do so we'll need the original value
					const replace_operation: ArrayReplace = {
						op: 'replace',
						index: i - 1,
						original: input[i - 1],
						value: output[j - 1],
					};
					alternatives.push(appendArrayOperation(replace_base, replace_operation));
				}
				// the only other case, i === 0 && j === 0, has already been memoized

				// the meat of the algorithm:
				// sort by cost to find the lowest one (might be several ties for lowest)
				// [4, 6, 7, 1, 2].sort((a, b) => a - b) -> [ 1, 2, 4, 6, 7 ]
				const best = alternatives.sort((a, b) => a.cost - b.cost)[0];
				memoized = best;
			}
			memo[memo_key] = memoized;
		}
		return memoized;
	}
	// handle weird objects masquerading as Arrays that don't have proper length
	// properties by using 0 for everything but positive numbers
	const input_length = (Number.isNaN(input.length) || input.length <= 0) ? 0 : input.length;
	const output_length = (Number.isNaN(output.length) || output.length <= 0) ? 0 : output.length;
	const array_operations = dist(input_length, output_length).operations;
	const [padded_operations] = array_operations.reduce<[Operation[], number]>(([operations, padding], array_operation) => {
		if (isArrayAdd(array_operation)) {
			const padded_index = array_operation.index + 1 + padding;
			const index_token = padded_index < (input_length + padding) ? String(padded_index) : '-';
			const operation = {
				op: array_operation.op,
				path: ptr.add(index_token).toString(),
				value: array_operation.value,
			};
			// padding++ // maybe only if array_operation.index > -1 ?
			return [operations.concat(operation), padding + 1];
		} else if (isArrayRemove(array_operation)) {
			const operation = {
				op: array_operation.op,
				path: ptr.add(String(array_operation.index + padding)).toString(),
			};
			// padding--
			return [operations.concat(operation), padding - 1];
		} else { // replace
			const replace_ptr = ptr.add(String(array_operation.index + padding));
			const replace_operations = diff(array_operation.original, array_operation.value, replace_ptr);
			return [operations.concat(...replace_operations), padding];
		}
	}, [[], 0]);
	return padded_operations;
}

export function diffObjects(input: Record<string, any>, output: Record<string, any>, ptr: Pointer, diff: Diff = diffAny): Operation[] {
	// if a key is in input but not output -> remove it
	const operations: Operation[] = [];
	subtract(input, output).forEach((key) => {
		operations.push({ op: 'remove', path: ptr.add(key).toString() });
	});
	// if a key is in output but not input -> add it
	subtract(output, input).forEach((key) => {
		operations.push({ op: 'add', path: ptr.add(key).toString(), value: output[key] });
	});
	// if a key is in both, diff it recursively
	intersection([input, output]).forEach((key) => {
		operations.push(...diff(input[key], output[key], ptr.add(key)));
	});
	return operations;
}

export function diffAny(input: any, output: any, ptr: Pointer, diff: Diff = diffAny): Operation[] {
	// strict equality handles literals, numbers, and strings (a sufficient but not necessary cause)
	if (input === output) {
		return [];
	}

	if (Array.isArray(input) && Array.isArray(output)) {
		return diffArrays(input, output, ptr, diff);
	}

	if (typeof input === 'object' && typeof output === 'object') {
		return diffObjects(
			input as Record<string, any>,
			output as Record<string, any>,
			ptr,
			diff,
		);
	}

	// at this point we know that input and output are materially different;
	// could be array -> object, object -> array, boolean -> undefined,
	// number -> string, or some other combination, but nothing that can be split
	// up into multiple patches: so `output` must replace `input` wholesale.
	return [{ op: 'replace', path: ptr.toString(), value: output }];
}
