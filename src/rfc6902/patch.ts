import type {
	Operation,
	AddOperation,
	CopyOperation,
	MoveOperation,
	TestOperation,
	RemoveOperation,
	ReplaceOperation,
} from './diff';

import { clone } from './util';
import { diffAny } from './diff';
import { Pointer } from './pointer';

export class MissingError extends Error {
	constructor(public path: string) {
		super(`Value required at path: ${path}`);
		this.name = 'MissingError';
	}
}

export class TestError extends Error {
	constructor(public actual: any, public expected: any) {
		super(`Test failed: ${actual} != ${expected}`);
		this.name = 'TestError';
	}
}

function _add(object: any, key: string, value: any): void {
	if (Array.isArray(object)) {
		// `key` must be an index
		if (key === '-') {
			object.push(value);
		} else {
			const index = Number.parseInt(key, 10);
			object.splice(index, 0, value);
		}
	} else {
		object[key] = value;
	}
}

function _remove(object: any, key: string): void {
	if (Array.isArray(object)) {
		// '-' syntax doesn't make sense when removing
		const index = Number.parseInt(key, 10);
		object.splice(index, 1);
	} else {
		// not sure what the proper behavior is when path = ''
		delete object[key];
	}
}

export function add(object: any, operation: AddOperation): MissingError | null {
	const endpoint = Pointer.fromJSON(operation.path).evaluate(object);
	// it's not exactly a "MissingError" in the same way that `remove` is -- more like a MissingParent, or something
	if (endpoint.parent === undefined) {
		return new MissingError(operation.path);
	}
	_add(endpoint.parent, endpoint.key, clone(operation.value));
	return null;
}

export function remove(object: any, operation: RemoveOperation): MissingError | null {
	// endpoint has parent, key, and value properties
	const endpoint = Pointer.fromJSON(operation.path).evaluate(object);
	if (endpoint.value === undefined) {
		return new MissingError(operation.path);
	}
	// not sure what the proper behavior is when path = ''
	_remove(endpoint.parent, endpoint.key);
	return null;
}

export function replace(object: any, operation: ReplaceOperation): MissingError | null {
	const endpoint = Pointer.fromJSON(operation.path).evaluate(object);
	if (endpoint.parent === null) {
		return new MissingError(operation.path);
	}
	// this existence check treats arrays as a special case
	if (Array.isArray(endpoint.parent)) {
		if (Number.parseInt(endpoint.key, 10) >= endpoint.parent.length) {
			return new MissingError(operation.path);
		}
	} else if (endpoint.value === undefined) {
		return new MissingError(operation.path);
	}
	endpoint.parent[endpoint.key] = clone(operation.value);
	return null;
}

export function move(object: any, operation: MoveOperation): MissingError | null {
	const from_endpoint = Pointer.fromJSON(operation.from).evaluate(object);
	if (from_endpoint.value === undefined) {
		return new MissingError(operation.from);
	}
	const endpoint = Pointer.fromJSON(operation.path).evaluate(object);
	if (endpoint.parent === undefined) {
		return new MissingError(operation.path);
	}
	_remove(from_endpoint.parent, from_endpoint.key);
	_add(endpoint.parent, endpoint.key, from_endpoint.value);
	return null;
}

export function copy(object: any, operation: CopyOperation): MissingError | null {
	const from_endpoint = Pointer.fromJSON(operation.from).evaluate(object);
	if (from_endpoint.value === undefined) {
		return new MissingError(operation.from);
	}
	const endpoint = Pointer.fromJSON(operation.path).evaluate(object);
	if (endpoint.parent === undefined) {
		return new MissingError(operation.path);
	}
	_add(endpoint.parent, endpoint.key, clone(from_endpoint.value));
	return null;
}

export function test(object: any, operation: TestOperation): TestError | null {
	const endpoint = Pointer.fromJSON(operation.path).evaluate(object);
	// TODO: this diffAny(...).length usage could/should be lazy
	if (diffAny(endpoint.value, operation.value, new Pointer()).length) {
		return new TestError(endpoint.value, operation.value);
	}
	return null;
}

export class InvalidOperationError extends Error {
	constructor(public operation: Operation) {
		super(`Invalid operation: ${operation.op}`);
		this.name = 'InvalidOperationError';
	}
}

export function apply(object: any, operation: Operation): MissingError | InvalidOperationError | TestError | null {
	// not sure why TypeScript can't infer typesafety of:
	//   {add, remove, replace, move, copy, test}[operation.op](object, operation)
	// (seems like a bug)
	switch (operation.op) {
		case 'add': return add(object, operation);
		case 'remove': return remove(object, operation);
		case 'replace': return replace(object, operation);
		case 'move': return move(object, operation);
		case 'copy': return copy(object, operation);
		case 'test': return test(object, operation);
	}
	return new InvalidOperationError(operation);
}
