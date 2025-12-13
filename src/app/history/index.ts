// shit *stub* code

import type { CanvasContext } from '@/app/context';
import * as rfc6902 from '@/rfc6902';
import { unwrapStore } from '@/app/utils';

let historyInterval: NodeJS.Timeout | null = null;
let historyPointer: number | null = null;
let historyRedoBorder: number | null = null;

export function historyCommit(store: CanvasContext) {
	const state = unwrapStore(store.state);
	const patch = rfc6902.createPatch(unwrapStore(store.prevState), state);
	if (patch.length === 0) {
		return;
	}

	store.history.push(patch);
	store.prevState = state;

	localStorage.setItem('canvas-history', JSON.stringify(store.history));
}

export function historyEnableAutoCommit(store: CanvasContext) {
	historyInterval = setInterval(() => historyCommit(store), 1000);
}

export function historyDisableAutoCommit() {
	if (historyInterval) {
		clearInterval(historyInterval);
		historyInterval = null;
	}
}

function historyStartTravel(store: CanvasContext) {
	historyPointer = store.history.length - 1;
	historyRedoBorder = historyPointer;
}

function historyEndTravel(_: CanvasContext) {
	historyPointer = null;
	historyRedoBorder = null;
}

function historyTravel(store: CanvasContext, direction: 'undo' | 'redo') {
	if (historyPointer === null) {
		historyStartTravel(store);
	}

	if (direction === 'undo') {
		const pointer = --historyPointer!;
		if (!(pointer in store.history)) {
			return;
		}

		const state: CanvasState[] = [];

		for (let i = 0; i < pointer; i++) {
			rfc6902.applyPatch(state, store.history[i]);
		}

		const str: string[] = [];

		for (const item of store.history) {
			str.push(JSON.stringify(item).substring(0, 40));
		}

		str[pointer] = str[pointer] + ' // pointer';
		str[historyRedoBorder!] = str[historyRedoBorder!] + ' // border';

		console.log('data:');
		console.log(str.join('\n'));
		console.log('end');

		rfc6902.applyPatch(store.state, rfc6902.createPatch(unwrapStore(store.state), state));
	} else {
		const pointer = ++historyPointer!;

		if (pointer > historyRedoBorder!) {
			return;
		}

		const str: string[] = [];

		for (const item of store.history) {
			str.push(JSON.stringify(item).substring(0, 40));
		}

		str[pointer] = str[pointer] + ' // pointer';
		str[historyRedoBorder!] = str[historyRedoBorder!] + ' // border';

		console.log('data:');
		console.log(str.join('\n'));
		console.log('end');

		const state = [] satisfies CanvasState[];

		for (let i = 0; i < pointer; i++) {
			rfc6902.applyPatch(state, store.history[i]);
		}

		rfc6902.applyPatch(store.state, rfc6902.createPatch(unwrapStore(store.state), state));
	}

	historyCommit(store);
}

// side effects but actually the minifier is disabled, so OKAY
(globalThis as any).historyStartTravel = historyStartTravel;
(globalThis as any).historyEndTravel = historyEndTravel;
(globalThis as any).historyTravel = historyTravel;
