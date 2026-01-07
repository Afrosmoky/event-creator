import { SvgDrawer } from './controllers/svg/SvgDrawer';
import { AppBottomMenu } from './controllers/svg/AppBottomMenu';
import { apiQuery } from './api/apiQuery';
import { batch, createEffect, createMemo, createSignal, onCleanup, onMount, Show, untrack } from 'solid-js';
import { createSvgItemFromBlueprint, isSvgItemIcon, isSvgItemTable, isSvgItemTableCircle, isSvgItemTableT, isSvgItemTableU, SvgItem, SvgItems, SvgItemTableCirclePropsDef, SvgItemTableTPropsDef, SvgItemTableUPropsDef, type SvgItemBlueprint } from './controllers/svg/SvgItem';
import { applyDiff, DeepPartial, getDiff, getItemDiff, GuestPatch, mergePatchArray, mergePatches, Patch, SeatClient, SeatPatch, useSvgDrawerContext } from './context/SvgDrawerContext';
import { API_ENDPOINTS, GuestAPIType, SeatAPIType, type ItemAPIType } from './api/apiEndpoints';
import { createStore, produce, unwrap } from 'solid-js/store';
import { useParams, useSearchParams } from '@solidjs/router';
import DrawerInspector from './controllers/svg/DrawerInspector';
import GuestListPanel from './controllers/svg/GuestListPanel';
import { CircleUserIcon, UsersRoundIcon } from 'lucide-solid';
import { DragDropProvider, DragDropSensors, DragEventHandler } from '@thisbeyond/solid-dnd';
import { Button } from './controllers/svg/UI';

const backendTypeToBlueprint = {
	["TABLE_RECT"]: SvgItems.TABLE_RECT,
	["square-table"]: SvgItems.TABLE_RECT,
	["TABLE_CIRCLE"]: SvgItems.TABLE_CIRCLE,
	["TABLE_T"]: SvgItems.TABLE_T,
	["TABLE_U"]: SvgItems.TABLE_U,
	["ICON"]: SvgItems.ICON
} as { [key: string]: SvgItemBlueprint }; 

class BiMap<TKey, TValue> {
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

interface BackendState {
	elements: Record<string, ItemAPIType>,
	seats: Record<string, SeatAPIType>,
	guests: Record<string, GuestAPIType>
}

export function App() {
	const [searchParams, setSearchParams] = useSearchParams();
	const ballroomId = createMemo(() => {
		return (Array.isArray(searchParams.ballroom) ? searchParams.ballroom[0] : searchParams.ballroom) || "1";
	})

	const [showGuestList, setShowGuestList] = createSignal(false);
	const lastBackendState: BackendState = {
		elements: {},
		seats: {},
		guests: {}
	}

	const canvas = useSvgDrawerContext();
	const ballroomAPI = apiQuery<ItemAPIType[]>({
		route: "GET_ELEMENTS",
		id: ballroomId()
	});

	const guestAPI = apiQuery<GuestAPIType[]>({
		route: "GUEST",
		id: ballroomId()
	});

	const seatAPI = apiQuery<SeatAPIType[]>({
		route: "GET_SEATS",
		id: ballroomId()
	});

	const seatIdMap = new BiMap<number, number>();
	const removedSeats = new Map<number, boolean>();

	const BASE_URL = 'https://afrosmoky.vps.webdock.cloud/api';
	let [processedPatches, setProcessedPatches] = createSignal(0);
	let [processedSeatPatches, setProcessedSeatPatches] = createSignal(0);
	let [processedGuestPatches, setProcessedGuestPatches] = createSignal(0);

	createEffect(() => {
		const data = ballroomAPI.data();
		if(data) {
			const itemsMap: Record<string, ItemAPIType> = {};
			for(const item of data) {
				itemsMap[item.id] = item;
			}

			untrack(() => {
				updateItemsFromServer(itemsMap);
			});
		}
	});

	createEffect(() => {
		const data = guestAPI.data();
		if(data) {
			untrack(() => {
				updateGuestsFromServer(data);
			})
		}
	});



	function updateGuestsFromServer(guests: GuestAPIType[]) {
		batch(() => {
			// remove non existing guests
			for(const existing of canvas.guests) {
				const newStateExists = guests.find(o => o.guest_id === existing.guest_id);
				if(!newStateExists) {
					canvas.setGuests(prev => prev.filter(o => o.guest_id != existing.guest_id));
				}
			}

			for(const newGuest of guests) {
				const existingIndex = canvas.guests.findIndex(o => o.guest_id === newGuest.guest_id);
				if(existingIndex != -1) {
					const diff = getDiff(canvas.guests[existingIndex], newGuest);
					if(!diff) {
						return;
					}

					canvas.setGuests(existingIndex, produce(guest => {
						applyDiff(guest, diff);
						return guest;
					}));
				} else {
					canvas.setGuests(canvas.guests.length, newGuest);
				}
			}
		});
	}

	createEffect(() => {
		const data = seatAPI.data();
		if(data) {
			untrack(() => {
				const map: Record<string, SeatAPIType> = {};
				for(const item of data) {
					map[item.id] = item;
				}

				updateSeatsFromServer(map);
			})
		}
	})

	const patchQueue: Patch[] = [];
	const seatPatchQueue: SeatPatch[] = [];
	const guestPatchQueue: GuestPatch[] = [];

	let flushing = false;
	let flushingSeatQueue = false;
	let flushingGuestQueue = false;
	let pollInterval: NodeJS.Timeout;

	onMount(() => {
		canvas.clearPatches();

		pollInterval = setInterval(() => {
			if(!flushing) {
				ballroomAPI.refetch();
			}

			if(!flushingSeatQueue) {
				seatAPI.refetch();
			}
			
			guestAPI.refetch();
		}, 3000);
	});

	onCleanup(() => {
		clearInterval(pollInterval);
	})
	
	const flush = debounce(async () => {
		if(flushing) {
			return;
		}

		flushing = true;

		try {
			while (patchQueue.length > 0) {
				const batch = patchQueue.splice(0);
				await sendPatchesToBackend(batch);
			}
		} finally {
			flushing = false;
		}
	}, 500);

	const flushSeats = debounce(async () => {
		if(flushingSeatQueue) {
			return;
		}

		flushingSeatQueue = true;

		try {
			while(seatPatchQueue.length > 0) {
				const batch = seatPatchQueue.splice(0);
				await sendSeatPatchesToBackend(batch);
			}
		} finally {
			flushingSeatQueue = false;
		}
	}, 500);

	const flushGuests = debounce(async () => {
		if(flushingGuestQueue) {
			return;
		}

		flushingGuestQueue = true;

		try {
			while (guestPatchQueue.length > 0) {
				const batch = guestPatchQueue.splice(0);
				for(const patch of batch) {
					if(patch.type != "mod") {
						console.warn('Invalid patch for guest');
						continue;
					}

					try {
						await fetch(BASE_URL + `/guest-notes/${patch.id}`, {
							method: "PUT",
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify(patch.value)
						});

						console.log('Sent guest patch successfuly');
					} catch(error) {
						console.error("Failed to send guest patch");
						console.error(error);
					}
					
				}
			}
		} finally {
			flushingGuestQueue = false;
		}
	}, 500);

	function emit(patch: Patch) {
		patchQueue.push(patch);
		if(!flushing) {
			flush();
		}
	}

	function emitSeatPatch(patch: SeatPatch) {
		seatPatchQueue.push(patch);
		if(!flushingSeatQueue) {
			flushSeats();
		}
	}

	function emitGuestPatch(patch: GuestPatch) {
		guestPatchQueue.push(patch);
		if(!flushingGuestQueue) {
			flushGuests();
		}
	}

	createEffect(() => {
		let processed = processedPatches();
		while(processed < canvas.patches.length) {
			emit(unwrap(canvas.patches[processed]));
			processed++;
		}
		setProcessedPatches(processed);
	});

	createEffect(() => {
		let processed = processedSeatPatches();
		while(processed < canvas.seatPatches.length) {
			emitSeatPatch(unwrap(canvas.seatPatches[processed]));
			processed++;
		}

		untrack(() => {
			setProcessedSeatPatches(processed);
		})
	});

	createEffect(() => {
		let processed = processedGuestPatches();
		while(processed < canvas.guestPatches.length) {
			emitGuestPatch(unwrap(canvas.guestPatches[processed]));
			processed++;
		}

		untrack(() => {
			setProcessedGuestPatches(processed);
		})
	});

	async function sendPatchesToBackend(patches: Patch[]) {
		const finalPatches: Patch[] = mergePatchArray(patches);
		console.log(`Merged item patches: `);
		console.log(finalPatches);

		for(const patch of finalPatches) {
			try {
				await sendPatchToServer(patch);
			} catch(error) {
				console.error(error);
			}
		}
	}

	async function sendSeatPatchesToBackend(patches: SeatPatch[]) {
		const merged = mergePatchArray(patches);
		console.log(`Merged seat patches: `);
		console.log(merged);

		for(const patch of merged) {
			try {
				await sendSeatPatchToBackend(patch);
			} catch(error) {
				console.error(error);
			}
		}
	}

	async function sendSeatPatchToBackend(patch: SeatPatch) {
		if(patch.type === "mod") {
			const seat = canvas.seatsMap[patch.id];
			if(!seat) {
				console.warn('Wanted to send mod patch but SEAT no longer exists');
				return;
			}

			if(!seatIdMap.hasKey(patch.id)) {
				console.warn(`Wanted to send MOD patch but SEAT ${patch.id} is not associated with backend`);
				return;
			}

			const backendId = seatIdMap.getValue(patch.id);
			
			console.log(`Sending PUT for seat ${seat.id} (${backendId})`);

			const endpointTemplate = API_ENDPOINTS.PUT_SEAT.endpoint;
			const endpoint = endpointTemplate.replace(':id', backendId.toString());

			const item = createBackendFromSeat(seat);
			delete item.id;

			await fetch(`${BASE_URL}${endpoint}`, {
				method: "PUT",
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(item)
			});
		} else if(patch.type === "add") {
			console.log(`Sending ADD patch for SEAT ${patch.id}`);

			const item = createBackendFromSeat(patch.item);
			delete item.id;

			const response = await fetch(`${BASE_URL}/seat`, {
				method: "POST",
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(item)
			});

			const body = await response.json();
			console.log(`Body from ADD`);
			console.log(body);

			const backendId = body.data.id;
			seatIdMap.set(patch.id, backendId);
		} else if(patch.type === "del") {
			if(!seatIdMap.hasKey(patch.id)) {
				console.warn(`Wanted to send DEL patch for SEAT ${patch.id} but it's not associated with backend`);
				return;
			}

			const backendId = seatIdMap.getValue(patch.id);

			seatIdMap.deleteByKey(patch.id);
			removedSeats.set(backendId, true);

			console.log(`Sending DEL patch for seat ${patch.id} (${backendId})`);

			await fetch(`${BASE_URL}/seat/${backendId}`, {
				method: "DELETE",
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}
	}

	async function sendPatchToServer(patch: Patch) {
		if(patch.type === "mod") {
			if(!canvas.items[patch.id]) {
				console.warn('Wanted to send mod patch but ITEM no longer exists');
				return;
			}

			console.log(`Sending MOD patch for item ${patch.id} with values: `);
			console.log(patch.value);

			const endpointTemplate = API_ENDPOINTS.UPDATE_ELEMENT.endpoint;
			const endpoint = endpointTemplate.replace(':id', patch.id.toString());

			const item = createBackendFromItem(canvas.items[patch.id]);
			await fetch(`${BASE_URL}${endpoint}`, {
				method: "PUT",
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(item)
			});
		} else if(patch.type === "add") {
			console.log(`Sending ADD patch for item ${patch.id}`);

			const endpoint = API_ENDPOINTS.ADD_ELEMENTS.endpoint;
			const item = createBackendFromItem(patch.item);
			item.id = undefined;

			const response = await fetch(`${BASE_URL}${endpoint}`, {
				method: "POST",
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(item)
			});

			const body = await response.json();
			const backendId = body.data.id;

			canvas.changeItemId(patch.id, backendId);
		} else if(patch.type === "del") {
			console.log(`Sending DEL patch for item ${patch.id}`);

			const endpointTemplate = API_ENDPOINTS.DELETE_ELEMENT.endpoint;
			const endpoint = endpointTemplate.replace(':id', patch.id.toString());

			await fetch(`${BASE_URL}${endpoint}`, {
				method: "DELETE",
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}
	}

	function updateSeatsFromServer(seats: Record<string, SeatAPIType>) {
		const diff = lastBackendState ? getDiff(lastBackendState.seats, seats) : seats;
		if(!diff) {
			return;
		}

		console.log(`==== SEATS DIFF ====`);
		console.log(diff);

		for(const key in diff) {
			const backendId = parseInt(key);
			const clientId = seatIdMap.getKey(backendId);
			const value = diff[key];

			if(!value) {
				if(clientId === undefined) {
					continue;
				}

				canvas.removeSeat(clientId, false);
				seatIdMap.deleteByKey(clientId);
			} else if(clientId == undefined || clientId == null) {
				if(removedSeats.has(backendId)) {
					console.warn(`Won't create server seat ${backendId}, it's already deleted`);
					continue;
				}

				const seat = canvas.addSeat(0, createSeatFromBackend(value), false);
				seatIdMap.set(seat.id, backendId);
			} else {
				const clientChange = createPartialSeatFromBackend(value);
				delete clientChange.id;
				console.log(`Client Change: `)
				console.log(clientChange);
				canvas.modifySeat(clientId, clientChange, false);
			}
		}

		console.log(`Local seat state: `);
		console.log(unwrap(canvas.seatsMap));
		console.log(seatIdMap.toString());

		lastBackendState.seats = seats;
	}

	function updateItemsFromServer(items: Record<string, ItemAPIType>) {
		const itemDiff = lastBackendState ? getDiff(lastBackendState.elements, items) : items;
		if(!itemDiff) {
			return;
		}

		console.log(`==== ITEMS DIFF ====`)
		console.log(itemDiff);

		for(const key in itemDiff) {
			const id = parseInt(key);
			const value = itemDiff[key];

			if(!value) {
				canvas.removeItem(id, false);
			} else if(!canvas.items[id]) {
				if(canvas.removed_ids.has(id)) {
					console.warn(`Won't create server item, cause it's already deleted`);
					continue;
				}

				const item = createItemFromBackend(value);
				canvas.addItem(id, item, false);
			} else {
				const fullBackendItem = items[id];
				const localFromBackend = createItemFromBackend(fullBackendItem);

				const unwraped = unwrap(canvas.items[id]);
				const diff = getItemDiff(unwraped, localFromBackend);
				if(!diff) {
					continue;
				}

				if(unwraped.last_update > localFromBackend.last_update) {
					console.warn("Wanted to update from server, but client is newer");
					console.log(diff);

					console.log(`Client: ${new Date(unwraped.last_update)}`)
					console.log(`Server: ${new Date(localFromBackend.last_update)}`)
					continue;
				}

				if(diff.props) {
					delete diff.props.preferred_seats;
				}

				console.log(`Detected diff for item ${id}`);
				console.log(diff);

				
				
				canvas.modifyItem(id, diff, false);
			}
		}

		applyDiff(lastBackendState.elements, itemDiff);
	}

	function createItemFromBackend(backend: DeepPartial<ItemAPIType>) {
		const blueprint = backendTypeToBlueprint[backend.kind.toUpperCase()];
		if(!blueprint) {
			console.warn(`Couldn't create item from backend!`);
			console.warn(backend);

			return;
		}

		const lastUpdated = new Date(backend.updated_at ?? 0).getTime() + (60 * 60 * 1000);

		const item = createSvgItemFromBlueprint(blueprint, backend.id);

		item.x = typeof backend.x === "number" ? backend.x : parseFloat(backend.x) ?? 0;
		item.y = typeof backend.y === "number" ? backend.y : parseFloat(backend.y) ?? 0;

		item.w = parseFloat(backend.config.width?.toString()) || 64;
		if(Number.isNaN(item.w)) item.w = 64;
		item.h = parseFloat(backend.config.height?.toString()) || 64;
		if(Number.isNaN(item.h)) item.h = 64;

		item.angle = parseFloat(backend.config.angle?.toString()) ?? 0;
		item.last_update = lastUpdated;

		if(isSvgItemTable(item)) {
			item.props.name = backend.name ?? "";
			item.props.seats = parseInt(backend.config.seats?.toString()) ?? 0;
			item.props.seat_spacing = parseFloat(backend.spacing?.toString()) ?? 0;
			item.props.color = backend.color ?? "#aaaaaa";

			if(isSvgItemTableT(item)) {
				item.props.top_height = backend.config.top_height ?? SvgItemTableTPropsDef["top_height"].min;
				item.props.middle_width = backend.config.bottom_width ?? SvgItemTableTPropsDef["middle_width"].min;
			} else if(isSvgItemTableU(item)) {
				item.props.arms_width = backend.config.arms_width ?? SvgItemTableUPropsDef["arms_width"].min;
				item.props.bottom_height = backend.config.bottom_height ?? SvgItemTableUPropsDef["bottom_height"].min;
			} else if(isSvgItemTableCircle(item)) {
				item.props.radius = parseFloat(backend.config.radius?.toString()) ?? SvgItemTableCirclePropsDef["radius"].min;
			}
		} else if(isSvgItemIcon(item)) {
			item.props.label = backend.name ?? "";
			item.props.icon = backend.icon ?? "air-conditioner";
		}

		return item;
	}

	function createBackendFromSeat(seat: SeatClient) {
		const backend: Omit<SeatAPIType, "created_at" | "updated_at"> = {
			id: seat.id,
			index: seat.seat_index,
			element_id: seat.table_id,
			guest_id: seat.guest_id,
			ballroom_id: ballroomId(),
			label: ""
		};

		return backend;
	}

	function createSeatFromBackend(seat: DeepPartial<SeatAPIType>) {
		const client: SeatClient = {
			id: seat.id,
			guest_id: seat.guest_id,
			table_id: seat.element_id,
			seat_index: seat.index
		};

		return client;
	}

	function createPartialSeatFromBackend(seat: DeepPartial<SeatAPIType>) {
		const client: DeepPartial<SeatClient> = {};

		if(seat.id != undefined) {
			client.id = seat.id;
		}

		if(seat.guest_id != undefined) {
			client.guest_id = seat.guest_id;
		}

		if(seat.element_id != undefined) {
			client.table_id = seat.element_id;
		}

		if(seat.index != undefined) {
			client.seat_index = seat.index;
		}

		return client;
	}

	function createBackendFromItem(item: SvgItem<any>) {
		const backend: Omit<ItemAPIType, "created_at" | "updated_at"> = {
			ballroom_id: ballroomId(),
			id: item.id,

			name: (isSvgItemTable(item) ? 
				item.props.name : isSvgItemIcon(item) ?
				item.props.label : "") || "",

			index: "",
			focus: "",
			icon: isSvgItemIcon(item) ?
				item.props.icon : "",

			x: item.x,
			y: item.y,
			color: isSvgItemTable(item) ?
				item.props.color : "",
			kind: item.kind,
			spacing: isSvgItemTable(item) ?
				item.props.seat_spacing : -1,
			status: "active",

			config: {
				seats: isSvgItemTable(item)
					? item.props.seats : -1,
				radius: isSvgItemTableCircle(item) ?
					item.props.radius : -1,
				width: item.w,
				height: item.h,
				size: -1,
				angle: item.angle,
				angle_origin_x: -1,
				angle_origin_y: -1,
				arms_width: isSvgItemTableU(item)
					? item.props.arms_width : null,
				bottom_height: isSvgItemTableU(item)
					? item.props.bottom_height : null,
				top_height: isSvgItemTableT(item)
					? item.props.top_height : null,
				bottom_width: isSvgItemTableT(item)
					? item.props.middle_width : null
			}
		};

		return backend;
	}

	return (
		<div class="relative w-full h-full" on:pointerdown={(e) => setShowGuestList(false)}>
			<SvgDrawer></SvgDrawer>
			<DrawerInspector />
			<GuestListPanel show={showGuestList()} />
			<div class="absolute top-1 right-1 flex flex-col gap-2">
				<button 
					class="
						rounded-sm w-full px-4 py-2 text-sm border-border border bg-primary-soft text-foreground cursor-pointer
						flex gap-2 items-center justify-center
					"
					onClick={() => setShowGuestList(!showGuestList())}
				>
					<UsersRoundIcon stroke-width={1.5} height={20} width="auto"/>
					<label class="pointer-events-none">Goście</label>
				</button>
			</div>
			<div class="absolute top-1 bottom-1 left-0 p-2 border-r border-border bg-card rounded-r-md shadow-black/20 shadow-sm">
				<AppBottomMenu />
			</div>
			<GuestDragOverlay guest={canvas.guests.find(o => o.id == canvas.draggingGuest())} />
			<GroupDragOverlay group={canvas.draggingGroup()} />
		</div>
	);
}

function GroupDragOverlay(
	props: { group: string }
) {
	const canvas = useSvgDrawerContext();
	const [state, setState] = createStore({
		x: 0,
		y: 0
	});

	onMount(() => {
		document.addEventListener("pointermove", onPointerMove);
		document.addEventListener("pointerup", onPointerUp);
	});

	onCleanup(() => {
		document.removeEventListener("pointermove", onPointerMove);
		document.removeEventListener("pointerup", onPointerUp);
	})

	const onPointerMove = (event: PointerEvent) => {
		setState(produce(state => {
			state.x = event.clientX;
			state.y = event.clientY;
		}))
	};

	const onPointerUp = (event: PointerEvent) => {
		canvas.setDraggingGroup(null);
	}
	
	return (
		<Show when={props.group}>
			<div 
				class="absolute pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 text-foreground flex flex-col gap-1 items-center"
				style={{
					"left": state.x + "px",
					"top": state.y + "px"
				}}
			>
				<UsersRoundIcon width={40} height={40} />
				<p class="text-xs">{props.group}</p>
			</div>
		</Show>
	);
}

function GuestDragOverlay(
	props: { guest: GuestAPIType }
) {
	const canvas = useSvgDrawerContext();
	const [state, setState] = createStore({
		x: 0,
		y: 0
	});

	onMount(() => {
		document.addEventListener("pointermove", onPointerMove);
		document.addEventListener("pointerup", onPointerUp);
	});

	onCleanup(() => {
		document.removeEventListener("pointermove", onPointerMove);
		document.removeEventListener("pointerup", onPointerUp);
	})

	const onPointerMove = (event: PointerEvent) => {
		setState(produce(state => {
			state.x = event.clientX;
			state.y = event.clientY;
		}))
	};

	const onPointerUp = (event: PointerEvent) => {
		canvas.setDraggingGuest(-1);
	}
	
	return (
		<div 
			class="absolute pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 text-foreground flex flex-col gap-1 items-center"
			classList={{
				"hidden": !props.guest
			}}
			style={{
				"left": state.x + "px",
				"top": state.y + "px"
			}}
		>
			<CircleUserIcon width={40} height="match" />
			<p class="text-xs">{props.guest?.name || "Unknown"}</p>
		</div>
	);
}
