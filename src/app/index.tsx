import { SvgDrawer } from './controllers/svg/SvgDrawer';
import { AppBottomMenu } from './controllers/svg/AppBottomMenu';
import { createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { Guest, useSvgDrawerContext } from './context/SvgDrawerContext';
import { createStore, produce } from 'solid-js/store';
import { useSearchParams } from '@solidjs/router';
import DrawerInspector from './controllers/svg/DrawerInspector';
import GuestListPanel from './controllers/svg/GuestListPanel';
import { UsersRoundIcon } from 'lucide-solid';
import { createGuestSync } from './controllers/svg/sync/guest-sync';
import { createGuestPolling } from './controllers/svg/polling/guest-polling';
import { createItemController } from './controllers/svg/controllers/item-controller';
import { createSeatController } from './controllers/svg/controllers/seat-controller';
import { GuestIcon } from './controllers/svg/GuestIcon';

export function App() {
	const [searchParams, setSearchParams] = useSearchParams();
	const ballroomId = createMemo(() => {
		return (Array.isArray(searchParams.ballroom) ? searchParams.ballroom[0] : searchParams.ballroom) || "1";
	})

	const [showGuestList, setShowGuestList] = createSignal(false);
	const canvas = useSvgDrawerContext();

	const draggingGuestObj = createMemo(() => canvas.guests.find(o => o.id == canvas.draggingGuest()));

	createItemController(ballroomId, canvas);
	createSeatController(ballroomId, canvas);

	createGuestSync(canvas);
	createGuestPolling(ballroomId, canvas);

	onMount(() => {
		canvas.clearPatches();
	});

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
			<Show when={draggingGuestObj()}>
				<GuestDragOverlay guest={draggingGuestObj()} />
			</Show>
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
	props: { guest: Guest }
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
		canvas.setDraggingGuest("");
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
			<GuestIcon guest={props.guest} radius={20} />
			<p class="text-xs">{props.guest?.name || "Unknown"}</p>
		</div>
	);
}
