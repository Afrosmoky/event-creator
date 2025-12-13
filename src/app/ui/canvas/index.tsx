import { isWebKit } from '@solid-primitives/platform';
import { For, Match, Switch, untrack } from 'solid-js';

import type { ZoomController } from '@/app/controllers';
import { useCanvasState } from '@/app/context';
import { CANVAS_FOCUS_ID } from '@/app/constants';

import { Icon, Table,UTable,TTable, Chairs, LongTable, SquareTable } from '@/app/elements';

import * as css from './styles.module.css';

export interface CanvasProps {
	controller: ZoomController;
}

export function Canvas(props: CanvasProps) {
	const controller = untrack(() => props.controller);

	const store = useCanvasState();

	return (
		<div class={css.canvasWrapper}>
			<svg
				class={css.canvas}

				on:pointerup={e => controller.handlePointerUp(e)}
				on:pointerdown={e => controller.handlePointerDown(e)}
				on:pointermove={e => controller.handlePointerMove(e)}

				on:wheel={{ passive: false, handleEvent: e => controller.handleWheel(e) }}

				ref={ref => controller.target = ref}
			>
				<filter id='canvas-grayscale'>
					<feColorMatrix type='luminanceToAlpha' />
				</filter>
				<g class={css.canvasGroup} ref={ref => controller.ref = ref}>
					<For each={store.state}>
						{item => (
							<Switch>
								<Match when={item.kind === 'table'}>
									<Table store={item as any} zoomController={controller} />
								</Match>
								<Match when={item.kind === 'square-table'}>
									<SquareTable store={item as any} zoomController={controller} />
								</Match>
								<Match when={item.kind === 'long-table'}>
									<LongTable store={item as any} zoomController={controller} />
								</Match>
								<Match when={item.kind === 'chairs'}>
									<Chairs store={item as any} zoomController={controller} />
								</Match>
								<Match when={item.kind === 'icon'}>
									<Icon store={item as any} zoomController={controller} />
								</Match>
								<Match when={item.kind === 't-table'}>
									<TTable store={item as any} zoomController={controller} />
								</Match>
								<Match when={item.kind === 'u-table'}>
									<UTable store={item as any} zoomController={controller} />
								</Match>
							</Switch>
						)}
					</For>
					{!isWebKit && <use class={css.canvasFocus} href={/* @once */ `#${CANVAS_FOCUS_ID}`} />}
				</g>
			</svg>
			{!isWebKit && (
				<svg
					class={css.canvasOverlay}
					style={{
						display: store.overlay ? undefined : 'none',
					}}
				>
					<g ref={ref => controller.overlay = ref}>
						<use href={/* @once */ `#${CANVAS_FOCUS_ID}`} />
					</g>
				</svg>
			)}
		</div>
	);
}
