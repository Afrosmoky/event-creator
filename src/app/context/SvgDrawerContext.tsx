import { batch, createContext, createEffect, createResource, createSignal, onCleanup, onMount, useContext } from "solid-js";
import type { SvgItem } from "../controllers/svg/SvgItem";
import { createStore, produce, reconcile, unwrap } from "solid-js/store";
import { GuestAPIType } from "../api/apiEndpoints";

export type SvgDrawerContextType = ReturnType<typeof makeSvgDrawerContext>;

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

export type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object
        ? DeepPartial<T[K]>
        : T[K]
};

export interface SeatClient {
    id: number;
    guest_id: string;
    table_id: number;
    seat_index: number;
}

export interface Guest {
    id: string;
    name: string;
    surname: string;
    gender: string;
    group: string;
    age_group: string;
    menu: string;
    note: string;
}

export type GenericPatch<T = any, IdType = number> = 
    { type: 'add', id: IdType, item: T } | 
    { type: 'mod', id: IdType, value: DeepPartial<T> } |
    { type: 'del', id: IdType, item?: T };

export type Patch = GenericPatch<SvgItem>;
export type SeatPatch = GenericPatch<SeatClient>;
export type GuestPatch = GenericPatch<Guest, string>;

export type PatchSender<T extends GenericPatch> = (patches: T[]) => Promise<void>;

function debounce<T extends unknown[], U>(
	callback: (...args: T) => PromiseLike<U> | U,
	wait: number
) {
	let timer: ReturnType<typeof setTimeout> | undefined;

	return (...args: T): Promise<U> => {
		if (timer) clearTimeout(timer);

		return new Promise(resolve => {
			timer = setTimeout(() => resolve(callback(...args)), wait);
		});
	};
}

export function createPolling<T>(callback: () => Promise<T>, interval: number, handler: (data: T) => void) {
    let stopped = false;
    let timeout: ReturnType<typeof setTimeout>;

    const [data, { refetch }] = createResource(callback);

    createEffect(() => {
        if(data()) {
            handler(data() as T);
        }
    });

    async function poll() {
        if(stopped) {
            return;
        }

        await refetch();
        timeout = setTimeout(poll, interval);
    }

    onCleanup(() => {
        stopped = true;
        if(timeout) {
            clearTimeout(timeout);
        }
    });

    poll();
}

export function createPatchSync<T extends GenericPatch<any, any>>(
    getter: () => T[],
    sender: PatchSender<T>,
    delay: number = 500
) {
    let processed = 0;
    let flushing = false;

    const queue: T[] = [];

    const flush = debounce(async () => {
        if(flushing) return;
        flushing = true;

        try {
            while(queue.length > 0) {
                const batch = queue.splice(0);
                await sender(batch);
            }
        } finally {
            flushing = false;
        }
    }, delay);

    function enqueue(patch: T) {
        queue.push(patch);
        flush();
    }

    createEffect(() => {
        const patches = getter();
        while(processed < patches.length) {
            enqueue(unwrap(patches[processed]));
            processed++;
        }
    });
}

export function mergePatches<T>(self: GenericPatch<T>, other: GenericPatch<T>) {
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
    } as GenericPatch<T>;
}

export function mergePatchArray<T extends GenericPatch<any, any>>(arr: T[]) {
    const merged: GenericPatch<T>[] = [];
    let current: GenericPatch<T> = null;

    for(const patch of arr) {
        if(!current) {
            current = patch;
            continue;
        }

        const newPatch = mergePatches(current, patch);
        if(newPatch) {
            current = newPatch;
        } else {
            merged.push(current);
            current = patch;
        }
    }

    if(current) {
        merged.push(current);
    }

    return merged;
}

export function getDiff<T extends object>(self: T, other: T): DeepPartial<T> {
    const diff: any = {};
    const keys = new Set([...Object.keys(self), ...Object.keys(other)]);
    let changed: boolean = false

    for(const key of keys) {
        if(!(key in self) && !(key in other)) {
            continue;
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

        if(self[key] && other[key] && typeof self[key] === 'object' && typeof other[key] === 'object') {
            const child = getDiff(self[key], other[key]);
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

export function getItemDiff<T extends Record<string, any>>(self: T, other: T): DeepPartial<T> {
    const diff: any = {};
    const keys = new Set([...Object.keys(self), ...Object.keys(other)]);
    let changed: boolean = false

    for(const key of keys) {
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
        if(diff[key] && typeof diff[key] == 'object') {
            if(!self[key] || typeof self[key] != 'object') {
                self[key] = {};
            }

            applyDiff(self[key], diff[key]);
        } else {
            self[key] = diff[key];
        }
    }
}

export function clear_same<T extends Record<string, any>>(self: T, other: T) {
    for(const key in self) {
        if(!(key in other)) {
            continue;
        }

        if(typeof self[key] === 'object' && typeof other[key] === 'object') {
            clear_same(self[key], other[key]);

            if(Object.keys(self[key]).length === 0) {
                delete self[key];
            }
        } else {
            if(self[key] === other[key]) {
                delete self[key];
            }
        }
    }
}

let seat_nonce = 0;
let item_nonce = 0;

export const makeSvgDrawerContext = () => {
    const [items, setItems] = createStore<{ [id: string]: SvgItem | undefined }>({});
    const [itemsArray, setItemsArray] = createStore<SvgItem[]>([]);
    const [focusedItemIndex, setFocusedItemIndex] = createSignal<number>(-1);
    const [focusedSeatIndex, setFocusedSeatIndex] = createSignal<number>(-1);
    const [zoom, setZoom] = createSignal<number>(1);
    const [panX, setPanX] = createSignal(0);
    const [panY, setPanY] = createSignal(0);
    const [rootDOM, setRootDOM] = createSignal<SVGSVGElement | null>(null);
    const [guests, setGuests] = createStore<Guest[]>([]);
    const [draggingGuest, setDraggingGuest] = createSignal("");
    const [draggingGroup, setDraggingGroup] = createSignal<string>(null);
    const [seats, setSeats] = createStore<SeatClient[]>([]);
    const [seatsMap, setSeatsMap] = createStore<{ [id: string]: SeatClient }>({});
    const [patches, setPatches] = createStore<Patch[]>([]);
    const [seatPatches, setSeatPatches] = createStore<SeatPatch[]>([]);
    const [clientWidth, setClientWidth] = createSignal(0);
    const [clientHeight, setClientHeight] = createSignal(0);
    const [showDietaryIcons, setShowDietaryIcons] = createSignal(true);

    const [guestPatches, setGuestPatches] = createStore<GuestPatch[]>([]);
    
    const removed_ids: Map<number, boolean> = new Map();

    function clearPatches() {
        setPatches(prev => []);
        setSeatPatches(prev => []);
        setGuestPatches(prev => []);
    }

    function modifyGuestNote(id: string, note: string) {
        const index = guests.findIndex(o => o.id === id);
        if(index === -1) {
            throw new Error("Can't modify note of unexisting guest " + id);
        }

        const patch: GuestPatch = {
            type: 'mod',
            id: id,
            value: { note: note }
        };

        batch(() => {
            setGuests(index, {
                note: note
            });
            setGuestPatches(guestPatches.length, patch);
        })
    }

    function addItem(id: number, item: SvgItem, emitPatch = true) {
        const patch: Patch = {
            type: 'add',
            id: id ?? (1_000_000 + item_nonce++),
            item: item
        };

        item.id = patch.id;

        batch(() => {
            applyPatch(patch);
            if(emitPatch) setPatches(patches.length, patch);
        });

        return item;
    }

    function modifyItem(id: number, change: DeepPartial<SvgItem>, emitPatch = true) {
        const patch: Patch = {
            type: 'mod',
            id: id,
            value: change
        };

        clear_same(change, items[id]);
        if(Object.keys(change).length === 0) {
            return;
        }

        if(!change.last_update) {
            change.last_update = Date.now();
        }

        batch(() => {
            applyPatch(patch);
            if(emitPatch) setPatches(patches.length, patch);
        });
    }

    function changeItemId(oldId: number, newId: number) {
        let refocus = false;

        batch(() => {
            if(focusedItemIndex() === oldId) {
                setFocusedItemIndex(-1);
                refocus = true;
            }

            setItems(oldId, "id", newId);
            setItems(newId, items[oldId]);
            setItems(oldId, undefined);
            refocus && setFocusedItemIndex(newId);
        });
    }

    function changeSeatId(oldId: number, newId: number) {
        batch(() => {
            setSeatsMap(oldId, "id", newId);
            setSeatsMap(newId, seatsMap[oldId]);
            setSeatsMap(oldId, undefined);
        });
    }

    function removeItem(id: number, emitPatch = true) {
        const patch: Patch = {
            type: 'del',
            id: id
        };

        batch(() => {
            for(const key in items) {
                const value = items[key];
                if(value.parent?.id === id) {
                    removeItem(value.id, false);
                }
            }

            applyPatch(patch);
            if(emitPatch) setPatches(patches.length, patch);
        });
    }

    function applyPatch(patch: Patch) {
        if(patch.type === 'add') {
            setItemsArray(itemsArray.length, patch.item);
            setItems(patch.id, patch.item);
        } else if(patch.type === 'del') {
            removed_ids.set(patch.id, true);

            if(focusedItemIndex() === patch.id) {
                setFocusedItemIndex(-1);
                setFocusedSeatIndex(-1);
            }

            const arrayIndex = itemsArray.findIndex(o => o.id == patch.id);
            if(arrayIndex != -1) {
                setItemsArray((prev) => prev.filter(o => o.id != patch.id));
            }
            setItems(patch.id, undefined);
        } else {
            setItems(patch.id, produce((item: SvgItem) => {
                applyDiff(item, patch.value);
                return item;
            }));
        }
    }

    function applySeatPatch(patch: SeatPatch) {
        if(patch.type === "add") {
            setSeats(seats.length, patch.item);
            setSeatsMap(patch.id, patch.item);
        } else if(patch.type === "del") {
            setSeats(prev => prev.filter(o => o.id !== patch.id));
            setSeatsMap(patch.id, undefined);
        } else {
            setSeatsMap(patch.id, produce((item) => {
                applyDiff(item, patch.value);
                return item;
            }));
        }
    }

    function addSeat(id: number | undefined, seat: SeatClient, emitPatch: boolean = true) {
        const patch: SeatPatch = {
            type: "add",
            id: id ?? (1_000_000 + seat_nonce++),
            item: seat
        };

        seat.id = patch.id;

        batch(() => {
            applySeatPatch(patch);
            if(emitPatch) setSeatPatches(seatPatches.length, patch);
        });

        return seat;
    }

    function modifySeat(id: number, change: Partial<SeatClient>, emitPatch = true) {
        const patch: SeatPatch = {
            type: "mod",
            id: id,
            value: change
        };

        batch(() => {
            applySeatPatch(patch);
            if(emitPatch) setSeatPatches(seatPatches.length, patch);
        });
    }

    function removeSeat(id: number, emitPatch = true) {
        const patch: SeatPatch = {
            type: "del",
            id: id,
            item: seatsMap[id]
        };

        batch(() => {
            applySeatPatch(patch);
            if(emitPatch) setSeatPatches(seatPatches.length, patch);
        });
    }

    function isGuestSeated(guest_id: string) {
        return seats.findIndex(o => o.guest_id == guest_id) != -1;
    }

    function seatGuest(guest_id: string, table_id: number, seat_index: number) {
        if(!guests.find(o => o.id == guest_id)) {
            throw new Error(`Can't seat guest ${guest_id}, doesn't exist!`);
        }

        const item = items[table_id];
        if(!item) {
            throw new Error(`Can't seat guest at table ${table_id}, doesn't exist!`);
        }

        if(!item.kind.startsWith("TABLE_")) {
            throw new Error(`Can't seat guest at element ${table_id}, not a table!`);
        }

        if(seat_index < 0) {
            throw new Error(`Invalid seat index!`);
        }

        batch(() => {
            const existingSeat = seats.find(o => o.guest_id == guest_id);
            if(existingSeat) {
                removeSeat(existingSeat.id);
            }

            const seated = seats.find(o => o.table_id === table_id && o.seat_index === seat_index);
            if(seated) {
                modifySeat(seated.id, {
                    guest_id: guest_id
                });
            } else {
                addSeat(undefined, {
                    id: undefined,
                    guest_id: guest_id,
                    table_id: table_id,
                    seat_index: seat_index
                });
            }
        });
    }

    function unseatGuest(guest_id: string) {
        const seat = seats.find(o => o.guest_id == guest_id);
        if(seat) {
            removeSeat(seat.id);
        }
    }

    function unseatTable(table_id: number) {
        const tableSeats = seats.filter(o => o.table_id === table_id);
        if(!tableSeats) {
            return;
        }

        batch(() => {
            for(const seat of tableSeats) {
                removeSeat(seat.id);
            }
        })
    }

    function unseatAllGuests(emitPatch: boolean = true) {
        batch(() => {
            for(let i = seats.length - 1; i >= 0; --i) {
                removeSeat(seats[i].id, emitPatch);
            }
        });
    }

    return {
        items,
        itemsArray,
        removed_ids,
        //setItems,
        focusedItemIndex,
        setFocusedItemIndex,
        focusedSeatIndex,
        setFocusedSeatIndex,
        zoom, setZoom,
        panX, setPanX,
        panY, setPanY,
        rootDOM, setRootDOM,
        guests, setGuests,
        seats, seatsMap, changeSeatId,
        addSeat, modifySeat, removeSeat, unseatTable,
        draggingGuest, setDraggingGuest,
        draggingGroup, setDraggingGroup,
        seatGuest, unseatGuest, isGuestSeated, unseatAllGuests,
        showDietaryIcons, setShowDietaryIcons,

        patches, seatPatches,
        clearPatches,
        addItem,
        changeItemId,
        modifyItem,
        removeItem,

        guestPatches, modifyGuestNote,

        clientWidth, setClientWidth,
        clientHeight, setClientHeight
    };
}

export function useSvgDrawerContext() {
    const context = useContext(SvgDrawerContext);
    if (!context) {
        throw new Error("useSvgDrawerContext must be used within a SvgDrawerContextProvider");
    }

    return context;
}