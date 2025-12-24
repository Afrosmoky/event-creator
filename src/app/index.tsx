import { SvgDrawer } from './controllers/svg/SvgDrawer';
import { SvgDrawerProperties } from './controllers/svg/SvgDrawerProperties';
import { AppBottomMenu } from './controllers/svg/AppBottomMenu';
import { apiQuery } from './api/apiQuery';
import { createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import { createSvgItemFromBlueprint, isSvgItemIcon, isSvgItemTable, isSvgItemTableT, isSvgItemTableU, SvgItem, SvgItems, SvgItemTableTPropsDef, SvgItemTableUPropsDef, type SvgItemBlueprint } from './controllers/svg/SvgItem';
import { applyDiff, getItemDiff, mergePatches, Patch, useSvgDrawerContext } from './context/SvgDrawerContext';
import { API_ENDPOINTS, type ItemAPIType } from './api/apiEndpoints';
import { unwrap } from 'solid-js/store';
import { useParams, useSearchParams } from '@solidjs/router';

const backendTypeToBlueprint = {
	["TABLE_RECT"]: SvgItems.TABLE_RECT,
	["square-table"]: SvgItems.TABLE_RECT,
	["TABLE_CIRCLE"]: SvgItems.TABLE_CIRCLE,
	["TABLE_T"]: SvgItems.TABLE_T,
	["TABLE_U"]: SvgItems.TABLE_U,
	["ICON"]: SvgItems.ICON
} as { [key: string]: SvgItemBlueprint }; 

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

export function App() {
	const [searchParams, setSearchParams] = useSearchParams();
	const ballroomId = createMemo(() => {
		return (Array.isArray(searchParams.ballroom) ? searchParams.ballroom[0] : searchParams.ballroom) || "1";
	})

	const canvas = useSvgDrawerContext();
	const ballroomAPI = apiQuery<ItemAPIType[]>({
		route: "GET_ELEMENTS",
		id: ballroomId()
	});

	const BASE_URL = 'https://afrosmoky.vps.webdock.cloud/api';
	let [processedPatches, setProcessedPatches] = createSignal(0);

	createEffect(() => {
		const data = ballroomAPI.data();
		if(data) {
			queueMicrotask(() => {
				updateItemsFromServer(data);
			});
		}
	});

	const patchQueue: Patch[] = [];
	let flushing = false;

	let pollInterval: NodeJS.Timeout;

	onMount(() => {
		pollInterval = setInterval(() => {
			if(flushing) {
				return;
			}

			ballroomAPI.refetch();
		}, 3000);
	});

	onCleanup(() => {
		clearInterval(pollInterval);
	})
	
	const flushDebounced = debounce(flush, 500);

	function emit(patch: Patch) {
		patchQueue.push(patch);

		if (!flushing) {
			flushDebounced();
		}
	}

	async function flush() {
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
	}

	createEffect(() => {
		let processed = processedPatches();
		while(processed < canvas.patches.length) {
			emit(unwrap(canvas.patches[processed]));
			processed++;
		}
		setProcessedPatches(processed);
	})

	async function sendPatchesToBackend(patches: Patch[]) {
		const finalPatches: Patch[] = [];
		let toMerge: Patch = null;

		for(const patch of patches) {
			if(!toMerge) {
				toMerge = patch;
				continue;
			}

			const newPatch = mergePatches(toMerge, patch);
			if(newPatch) {
				toMerge = newPatch;
			} else {
				finalPatches.push(toMerge);
				toMerge = null;
			}
		}

		if(toMerge) {
			finalPatches.push(toMerge);
		}

		for(const patch of finalPatches) {
			try {
				await sendPatchToServer(patch);
			} catch(error) {
				console.error(error);
			}
		}
	}

	async function sendPatchToServer(patch: Patch) {
		if(patch.type === "mod") {
			if(!canvas.items[patch.id]) {
				console.warn('wanted to send mod patch but item no longer exists');
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
			const shouldFocus = canvas.focusedItemIndex() === patch.id;

			canvas.removeItem(patch.id, false);
			canvas.addItem(backendId, createItemFromBackend(body.data), false);
			shouldFocus && canvas.setFocusedItemIndex(backendId);
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

	function updateItemsFromServer(items: ItemAPIType[]) {
		// delete items that are no longer there
		for(const key in canvas.items) {
			const backendExists = items.findIndex(o => o.id === parseInt(key)) != -1;
			if(!backendExists) {
				canvas.removeItem(parseInt(key), false);
			}
		}

		for(const backendItem of items) {
			const item = createItemFromBackend(backendItem);

			if(!canvas.items[backendItem.id]) {
				if(canvas.removed_ids.has(backendItem.id)) {
					console.warn(`Won't create server item, cause it's already deleted`);
					continue;
				}

				canvas.addItem(backendItem.id, item, false);
			} else {
				const unwraped = unwrap(canvas.items[backendItem.id]);
				const diff = getItemDiff(unwraped, item);
				if(!diff) {
					continue;
				}

				if(unwraped.last_update > item.last_update) {
					console.warn("Wanted to update from server, but client is newer");
					console.log(diff);

					console.log(`Client: ${new Date(unwraped.last_update)}`)
					console.log(`Server: ${new Date(item.last_update)}`)
					return;
				}

				console.log(`Detected diff for item ${backendItem.id}`);
				console.log(diff);

				canvas.modifyItem(backendItem.id, diff, false);
			}
		}
	}

	function createItemFromBackend(backend: ItemAPIType) {
		const blueprint = backendTypeToBlueprint[backend.kind.toUpperCase()];
		if(!blueprint) {
			console.warn(`Couldn't create item from backend!`);
			console.warn(backend);

			return;
		}

		const lastUpdated = new Date(backend.updated_at).getTime() + (60 * 60 * 1000);

		const item = createSvgItemFromBlueprint(blueprint, backend.id);

		item.x = typeof backend.x === "number" ? backend.x : parseFloat(backend.x) ?? 0;
		item.y = typeof backend.y === "number" ? backend.y : parseFloat(backend.y) ?? 0;

		item.w = parseFloat(backend.config.width?.toString()) ?? 64;
		item.h = parseFloat(backend.config.height?.toString()) ?? 64;

		item.angle = parseFloat(backend.config.angle?.toString()) ?? 0;
		item.last_update = lastUpdated;

		if(isSvgItemTable(item)) {
			item.props.name = backend.name ?? "";
			item.props.seats = backend.config.seats ?? 0;
			item.props.seat_spacing = parseFloat(backend.spacing?.toString()) ?? 0;
			item.props.color = backend.color ?? "#aaaaaa";

			if(isSvgItemTableT(item)) {
				item.props.top_height = backend.config.top_height ?? SvgItemTableTPropsDef["top_height"].min;
				item.props.middle_width = backend.config.bottom_width ?? SvgItemTableTPropsDef["middle_width"].min;
			} else if(isSvgItemTableU(item)) {
				item.props.arms_width = backend.config.arms_width ?? SvgItemTableUPropsDef["arms_width"].min;
				item.props.bottom_height = backend.config.bottom_height ?? SvgItemTableUPropsDef["bottom_height"].min;
			}
		} else if(isSvgItemIcon(item)) {
			item.props.label = backend.name ?? "";
			item.props.icon = backend.icon ?? "air-conditioner";
		}

		return item;
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
				radius: isSvgItemTable(item) ?
					item.props.seat_radius : -1,
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
		<>
			<SvgDrawer></SvgDrawer>
			<SvgDrawerProperties />
			<div class="absolute top-0 bottom-0 left-0 p-2 border-r border-gray-300 bg-white shadow-black/40 shadow-md">
				<AppBottomMenu />
			</div>
		</>
	);
}
