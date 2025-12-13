import { batch } from 'solid-js';

export function mutate<T extends object, S extends object>(target: T, source: S): T & S {
	return batch(() => Object.assign(target, source));
}

/**
 * Unwraps a store proxy into a plain object
 *
 * @remarks
 * Very-very-very weird, but... Okay?
 *
 * @param value an store object from createStore/createMutable
 * @returns object which is a non-proxy snapshot of the store
 */
export function unwrapStore<T>(value: T): T {
	return JSON.parse(JSON.stringify(value));
}
