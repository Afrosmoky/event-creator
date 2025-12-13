import { Canvas } from '@/app/ui/canvas';
import { Show, createSignal } from 'solid-js';
import { BottomMenu } from '@/app/ui/bottom-menu';
import { ZoomController } from '@/app/controllers';
import { PanelGuest } from '@/app/elements/userList/panel';
import { createCanvasState, CanvasStateProvider } from '@/app/context';
import { Panel } from './ui/panel';

export function App() {
	const store = createCanvasState();
	const [guestList, setGuestList] = createSignal(false);

	const handleGuestList = () => {
		setGuestList(prev => !prev);
	};
	const controller = new ZoomController(
		'canvas',
		() => {
			// store.prevFocus = store.focus;
			// store.focus = null;
		},
	);

	return (
		<CanvasStateProvider store={store}>
			<div class='size-full flex' ref={el => store.canvasRef = el}>
				<Canvas controller={controller} />
				<Show when={guestList()}>
					<PanelGuest store={store} />
				</Show>
				<Panel />

				<BottomMenu zoomController={controller} guestList={guestList} handleGuestList={handleGuestList} />
			</div>
		</CanvasStateProvider>
	);
}
