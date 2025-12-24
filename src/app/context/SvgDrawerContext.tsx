import { createContext, createSignal, useContext } from "solid-js";
import type { SvgItem } from "../controllers/svg/SvgItem";
import { createStore, produce, reconcile, unwrap } from "solid-js/store";

type SvgDrawerContextType = ReturnType<typeof makeSvgDrawerContext>;

const SvgDrawerContext = createContext<SvgDrawerContextType>();

export function SvgDrawerContextProvider(
    props: any
) {
    const value = makeSvgDrawerContext();

    return (
        <SvgDrawerContext.Provider value={value}>
            {props.children}
        </SvgDrawerContext.Provider>
    )
}

type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object
        ? DeepPartial<T[K]>
        : T[K]
};

export type Patch = 
    { type: 'add', id: number, item: SvgItem } | 
    { type: 'mod', id: number, value: DeepPartial<SvgItem> } |
    { type: 'del', id: number };

export function mergePatches(self: Patch, other: Patch) {
    if(self.type != 'mod' || other.type != 'mod') {
        return null;
    }

    if(self.id != other.id) {
        return null;
    }

    const finalValue: any = self.value;
    const walk = (self, other) => {
        for(const key in other) {
            if(typeof other[key] === "object") {
                if(!self[key]) {
                    self[key] = other[key];
                } else {
                    walk(self[key], other[key]);
                }
            } else {
                self[key] = other[key];  
            }
        }
    };

    walk(finalValue, other.value);
    return {
        type: 'mod',
        id: self.id,
        value: finalValue
    } as Patch;
}

export function getItemDiff<T extends Record<string, any>>(self: T, other: T): DeepPartial<T> {
    const diff: any = {};
    const keys = new Set([...Object.keys(self), ...Object.keys(other)]);
    let changed: boolean = false

    for(const key of keys) {
        if(key === "last_update") {
            //continue;
        }

        if(!(key in self)) {
            diff[key] = other[key];
            changed = true;

            continue;
        }

        if(!(key in other)) {
            diff[key] = undefined;
            changed = true;

            continue;
        }

        if(typeof self[key] === 'object' && typeof other[key] === 'object') {
            const child = getItemDiff(self[key], other[key]);
            if(child) {
                diff[key] = child;
                changed = true;
            }

            continue;
        }

        if(self[key] != other[key]) {
            diff[key] = other[key];
            changed = true;
        }
    }

    return changed ? diff : null;
}

export function applyDiff<T extends Record<string, any>>(self: any, diff: T) {
    for(const key in diff) {
        if(typeof diff[key] == 'object') {
            if(!self[key] || typeof self[key] != 'object') {
                self[key] = {};
            }

            applyDiff(self[key], diff[key]);
        } else {
            self[key] = diff[key];
        }
    }
}


export const makeSvgDrawerContext = () => {
    const [items, setItems] = createStore<{ [id: string]: SvgItem | undefined }>({});
    const [focusedItemIndex, setFocusedItemIndex] = createSignal<number>(-1);
    const [zoom, setZoom] = createSignal<number>(1);
    const [panX, setPanX] = createSignal(0);
    const [panY, setPanY] = createSignal(0);
    const [rootDOM, setRootDOM] = createSignal<SVGSVGElement | null>(null);
    const [patches, setPatches] = createStore<Patch[]>([]);
    
    const removed_ids: Map<number, boolean> = new Map();

    function addItem(id: number, item: SvgItem, emitPatch = true) {
        const patch: Patch = {
            type: 'add',
            id: id,
            item: item
        };

        applyPatch(patch);
        if(emitPatch) setPatches(patches.length, patch);
    }

    function modifyItem(id: number, change: DeepPartial<SvgItem>, emitPatch = true) {
        const patch: Patch = {
            type: 'mod',
            id: id,
            value: change
        };

        if(!change.last_update) {
            change.last_update = Date.now();
        }

        applyPatch(patch);
        if(emitPatch) setPatches(patches.length, patch);
    }

    function changeItemId(oldId: number, newId: number) {
        let refocus = false;
        if(focusedItemIndex() === oldId) {
            setFocusedItemIndex(-1);
            refocus = true;
        }

        setItems(oldId, "id", newId);
        setItems(newId, items[oldId]);
        setItems(oldId, undefined);
        refocus && setFocusedItemIndex(newId);
    }

    function removeItem(id: number, emitPatch = true) {
        const patch: Patch = {
            type: 'del',
            id: id
        };

        applyPatch(patch);
        if(emitPatch) setPatches(patches.length, patch);
    }

    function applyPatch(patch: Patch) {
        if(patch.type === 'add') {
            setItems(patch.id, patch.item);
        } else if(patch.type === 'del') {
            removed_ids.set(patch.id, true);

            if(focusedItemIndex() === patch.id) {
                setFocusedItemIndex(-1);
            }

            setItems(patch.id, undefined);
        } else {
            setItems(patch.id, produce((item: SvgItem) => {
                const walk = (item, change) => {
                    for(const key in change) {
                        if(typeof change[key] === "object") {
                            if(!item[key]) {
                                item[key] = change[key];
                            } else {
                                walk(item[key], change[key]);
                            }
                        } else {
                            item[key] = change[key];  
                        }
                    }
                };

                walk(item, patch.value);

                return item;
            }));
        }
    }

    return {
        items,
        removed_ids,
        //setItems,
        focusedItemIndex,
        setFocusedItemIndex,
        zoom, setZoom,
        panX, setPanX,
        panY, setPanY,
        rootDOM, setRootDOM,

        patches,
        addItem,
        changeItemId,
        modifyItem,
        removeItem
    };
}

export function useSvgDrawerContext() {
    const context = useContext(SvgDrawerContext);
    if (!context) {
        throw new Error("useSvgDrawerContext must be used within a SvgDrawerContextProvider");
    }

    return context;
}