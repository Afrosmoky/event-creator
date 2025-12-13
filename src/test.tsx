/*
import type { SpritesMap } from '@/sprite.gen.ts';
import { SPRITES_META } from '@/sprite.gen.ts';

import { isWebKit } from '@solid-primitives/platform';

import { Icon } from '@/components/Icon';
import { Button } from '@/components/Button';

import {
	For,
	Match,
	Switch,
	onMount,
	onCleanup,
	useContext,
	createSignal,
} from 'solid-js';

import * as css from './test.module.css';
import { Popover, PopoverContent, PopoverTrigger } from './components/Popover';

export function Main() {
	const store = useContext(PanelStateContext)!;

	(globalThis as any).store = store;

	function keyPressHandler(e: KeyboardEvent) {
		const ctrl = e.ctrlKey || e.metaKey;
		if (ctrl && e.key === 'z') {
			if (e.shiftKey) {
				historyTravel(store, 'redo');
			} else {
				historyTravel(store, 'undo');
			}
		} else if (ctrl && e.key === 'y') {
			historyTravel(store, 'redo');
		}
	}

	onMount(() => {
		controller.handleMount();
		historyEnableAutoCommit(store);
		window.addEventListener('keydown', keyPressHandler);
	});

	onCleanup(() => {
		historyDisableAutoCommit();
		window.removeEventListener('keydown', keyPressHandler);
	});

	const [overlay, setOverlay] = createSignal(false);
	const [menu1, setMenu1] = createSignal(false);

	(globalThis as any).setOverlay = setOverlay;

	return (
		<>
			<PanelWrapper />
			<div
				class='absolute left-[8px] top-[3px] text-xl'
				ref={ref => controller.positionOverlay = ref}
			/>
		</>
	);
}
*/
