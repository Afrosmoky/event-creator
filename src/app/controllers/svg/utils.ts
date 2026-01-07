export function num(v: unknown): number | undefined {
    if (v == null) return undefined;
    const n = typeof v === "number" ? v : parseFloat(v as any);
    return Number.isFinite(n) ? n : undefined;
}

export function str(v: unknown): string | undefined {
    return typeof v === "string" ? v : undefined;
}

export function color(v: unknown): string | undefined {
    if (typeof v !== "string") {
        return undefined;
    }

    const s = v.trim();
    if (/^#([0-9a-fA-F]{6})$/.test(s)) {
        return s;
    }

    return undefined;
}

export function assign<T, K extends keyof T>(target: T, key: K, value: unknown, map: (v: unknown) => T[K] | undefined) {
    if(value === undefined) {
        return;
    }

    const v = map(value);
    if(v === undefined) {
        return;
    }

    target[key] = v;
}

export class BiMap<TKey, TValue> {
    private _forward: Map<TKey, TValue> = new Map();
    private _reverse: Map<TValue, TKey> = new Map();

    set(key: TKey, value: TValue) {
        this._forward.set(key, value);
        this._reverse.set(value, key);
    }

    getValue(key: TKey) {
        return this._forward.get(key);
    }

    getKey(value: TValue) {
        return this._reverse.get(value);
    }

    hasKey(key: TKey) {
        return this._forward.has(key);
    }

    hasValue(value: TValue) {
        return this._reverse.has(value);
    }

    deleteByKey(key: TKey) {
        if(!this._forward.has(key)) {
            return;
        }

        this._reverse.delete(this._forward.get(key));
        this._forward.delete(key);
    }

    deleteByValue(value: TValue) {
        if(!this._reverse.has(value)) {
            return;
        }

        this._forward.delete(this._reverse.get(value));
        this._reverse.delete(value);
    }

    toString() {
        let str = "";
        for(const [key, value] of this._forward) {
            str += `${key} -> ${value}\n`;
        }

        return str;
    }
}