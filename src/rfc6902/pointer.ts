export function unescapeToken(token: string): string {
	return token.replace(/~1/g, '/').replace(/~0/g, '~');
}

export function escapeToken(token: string): string {
	return token.replace(/~/g, '~0').replace(/\//g, '~1');
}

export interface PointerEvaluation {
	parent: any;
	key: string;
	value: any;
}

export class Pointer {
	constructor(public tokens = ['']) { }

	static fromJSON(path: string): Pointer {
		const tokens = path.split('/').map(unescapeToken);
		if (tokens[0] !== '') {
			throw new Error(`Invalid JSON Pointer: ${path}`);
		}
		return new Pointer(tokens);
	}

	toString(): string {
		return this.tokens.map(escapeToken).join('/');
	}

	evaluate(object: any): PointerEvaluation {
		let parent: any = null;
		let key = '';
		let value = object;
		for (let i = 1, l = this.tokens.length; i < l; i++) {
			parent = value;
			key = this.tokens[i];
			if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
				continue;
			}
			// not sure if this the best way to handle non-existant paths...
			// eslint-disable-next-line ts/strict-boolean-expressions
			value = (parent || {})[key];
		}
		return { parent, key, value };
	}

	get(object: any): any {
		return this.evaluate(object).value;
	}

	set(object: any, value: any): void {
		const endpoint = this.evaluate(object);
		// eslint-disable-next-line ts/strict-boolean-expressions
		if (endpoint.parent) {
			endpoint.parent[endpoint.key] = value;
		}
	}

	push(token: string): void {
		// mutable
		this.tokens.push(token);
	}

	add(token: string): Pointer {
		const tokens = this.tokens.concat(String(token));
		return new Pointer(tokens);
	}
}
