export function num(v: unknown): number | undefined {
    if (v == null) return undefined;
    const n = typeof v === "number" ? v : parseFloat(v as any);
    return Number.isFinite(n) ? n : undefined;
}

export function bool(v: unknown): boolean | undefined {
    if (typeof v === "boolean") {
        return v;
    }
    
    if (typeof v === "string") {
        const s = v.trim().toLowerCase();
        if (s === "true") return true;
        if (s === "false") return false;
    }

    return undefined;
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