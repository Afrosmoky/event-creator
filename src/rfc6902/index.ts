import type {
	Diff,
	Operation,
	VoidableDiff,
	TestOperation,
} from './diff';

import { apply } from './patch';
import { Pointer } from './pointer';
import { diffAny, isDestructive } from './diff';

export { Pointer };
export type { Operation, TestOperation };

export type Patch = Operation[];

export function applyPatch(object: any, patch: Operation[]) {
	return patch.map(operation => apply(object, operation));
}

function wrapVoidableDiff(diff: VoidableDiff): Diff {
	function wrappedDiff(input: any, output: any, ptr: Pointer): Operation[] {
		const custom_patch = diff(input, output, ptr);
		// ensure an array is always returned
		return Array.isArray(custom_patch) ? custom_patch : diffAny(input, output, ptr, wrappedDiff);
	}
	return wrappedDiff;
}

export function createPatch(input: any, output: any, diff?: VoidableDiff): Operation[] {
	const ptr = new Pointer();
	// a new Pointer gets a default path of [''] if not specified
	return (diff ? wrapVoidableDiff(diff) : diffAny)(input, output, ptr);
}

function createTest(input: any, path: string): TestOperation | undefined {
	const endpoint = Pointer.fromJSON(path).evaluate(input);
	if (endpoint !== undefined) {
		return { op: 'test', path, value: endpoint.value };
	}
}

export function createTests(input: any, patch: Operation[]): TestOperation[] {
	const tests = new Array<TestOperation>();
	patch.filter(isDestructive).forEach((operation) => {
		const pathTest = createTest(input, operation.path);
		if (pathTest) {
			tests.push(pathTest);
		}
		if ('from' in operation) {
			const fromTest = createTest(input, operation.from);
			if (fromTest) {
				tests.push(fromTest);
			}
		}
	});
	return tests;
}
