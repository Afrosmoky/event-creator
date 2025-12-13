import {
	For,
	
	on,
	onMount,
	untrack,
	createEffect,
} from 'solid-js';

import type { BaseState, WithSeatsState, BaseCanvasProps, WithRotationState } from '@/app/state';
import { useCanvasState } from '@/app/context';
import { CANVAS_FOCUS_ID } from '@/app/constants';
import { mutate, setAttributeForwawrd } from '@/app/utils';
import { MoveController, ResizeController } from '@/app/controllers';

export interface ChairsState extends BaseState, WithSeatsState, WithRotationState {
	kind: 'chairs';
	config: {
		width: number;
	};
}

export interface ChairsProps extends BaseCanvasProps<ChairsState> {}

export function Chairs(props: ChairsProps) {
	const store = untrack(() => props.store);
	const zoomController = untrack(() => props.zoomController);
	const context = useCanvasState();
	context.isDragging = true;
	let startAngle = 0;
	let initialAngle = 0;

	const moveController = new MoveController(
		zoomController,

		// 1️⃣ MOVE HANDLER (przesuwanie)
		(x, y) => {
			const clampedX = Math.max(0, x);
			const clampedY = Math.max(0, y);
			mutate(store, { x: clampedX, y: clampedY });
		},

		// 2️⃣ POINTER DOWN / START MOVE
		() => {
			// Ustaw focus dla UI
			context.uiFocus = store;

			// Ustaw focus dla drag
			context.dragFocus = store;
		},

		// 3️⃣ POINTER UP
		() => {
			// wywołujemy hook jeśli istnieje
			store.upHook?.();

			// zakończ drag
			context.dragFocus = null;
		}
	);

	const resizeController = new ResizeController<{
		rect: SVGRectElement;
		chairs: SVGGElement;
		anchor: SVGGElement;
		stick: SVGGElement;
	}>(
		zoomController,
		{},
		// @ts-ignore
		(reload, event, element, zoom, deltaX, _, storage) => {
			// @ts-ignore
			if (element === storage.stick) {
				if (!event) return;

				const rect = storage.rect.getBoundingClientRect();
				const cx = rect.left + rect.width / 2;
				const cy = rect.top + rect.height / 2;

				const dx = event.clientX - cx;
				const dy = event.clientY - cy;

				const currentAngle = Math.atan2(dy, dx);
				const delta = currentAngle - startAngle;

				let degrees = (initialAngle + delta) * (180 / Math.PI);
				if (degrees < 0) degrees += 360;

				store.angle = degrees;
				return;
			}

			const angle = (store.angle || 0) * Math.PI / 180;
      const dx = deltaX * Math.cos(angle) - deltaX * Math.sin(angle);

			const newWidth = reload
  ? store.config.width
  : +(storage.rect.getAttribute('width') ?? 0) + dx;

			const width = setAttributeForwawrd(
				storage.rect,
				'width',
			_ => Math.max(40, newWidth)
			);

			if (!reload) {
				store.config.width = width;
			}

			store.seats = Math.max(1, Math.floor(width / store.spacing));

			const chairs = storage.chairs.children;
			const step = width / (chairs.length + 1);

			for (const element of chairs) {
				const chair = element as SVGGElement;
				const index = +chair.dataset.index!;
				chair.setAttribute('transform', `translate(${step * (index + 1)}, -16)`);
			}

			store.angleOriginX = width / 2;
		},
	);

	createEffect(() => moveController.move(store.x, store.y));

	createEffect(on(
		[
			() => store.seats,
			() => store.config.width,
		],
		() => resizeController.reload(),
	));

	onMount(() => {
		store.startMoving = e => moveController.startMoving(e);
	});

	return (
		<g
			on:pointerup={async e => {
				// @ts-ignore
				(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
				context.isDragging = false;
				// @ts-ignore
				console.log("POINTERUP for ID:", store.id);
				// @ts-ignore
				console.log("FOCUS AT UP:", context.dragFocus?.id);

				const el = context.dragFocus; // ← ZAWSZE poprawny obiekt
				if (el) {
					// @ts-ignore
					console.log("[UPDATING] sending PUT for id", el.id);
					await context.focusAndUpdateElement(el);
				}

				context.dragFocus = null;
				moveController.handlePointerUp(e);
			}}
			on:pointerdown={e => {
				// @ts-ignore
				(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
				context.isDragging = true;
				// @ts-ignore
				console.log("POINTERDOWN on ID:", store.id);
				context.dragFocus = store;
				context.uiFocus = store;
				// @ts-ignore
				console.log("CURRENT FOCUS:", context.dragFocus.id);
				moveController.handlePointerDown(e)
			}}
			ref={ref => moveController.ref = ref}
			id={context.dragFocus ? CANVAS_FOCUS_ID : undefined}
		>
			<g
				style={{
					'transform': `rotate(${store.angle}deg)`,
					'transform-origin': `${store.angleOriginX}px ${store.angleOriginY}px`,
				}}
			>
				<rect
					fill={store.color}
					ref={ref => resizeController.storage.rect = ref}
					height={32}
					width={store.config.width}
				/>
				<g ref={ref => resizeController.storage.chairs = ref}>
					<For each={Array.from({ length: store.seats }, (_, i) => i)}>
						{n => (
							<g data-index={n}>
								<circle fill="none" stroke="#475c6c" stroke-width="1" stroke-dasharray="4 2" r={15} />
								<text
									text-anchor='middle'
									dominant-baseline='middle'
									font-size='20'
									fill='#475c6c'
								>
									{n + 1}
								</text>
							</g>
						)}
					</For>
				</g>

				<g
					ref={ref => resizeController.storage.stick = ref}
					transform={`translate(-11.5, ${32 / 2 - 11.5})`}
					on:pointerup={e => resizeController.handlePointerUp(e)}
					on:pointerdown={e => {
						const rect = resizeController.storage.rect?.getBoundingClientRect();
						if (!rect) return;
						const cx = rect.left + rect.width / 2;
						const cy = rect.top + rect.height / 2;

						const dx = e.clientX - cx;
						const dy = e.clientY - cy;

						startAngle = Math.atan2(dy, dx);
						initialAngle = (store.angle || 0) * (Math.PI / 180);

						resizeController.handlePointerDown(e);
					}}
				>
					<g>
						<circle fill='#666666' cx='11.5' cy='11.5' r='11.5' />
						<circle fill='#FFFFFF' cx='11.5' cy='11.5' r='5.75' />
					</g>
				</g>

				<g
					ref={ref => resizeController.storage.anchor = ref}
					transform={`translate(${store.config.width - 11.5}, ${32 / 2 + 11.5})`}
					on:pointerup={e => resizeController.handlePointerUp(e)}
					on:pointerdown={e => resizeController.handlePointerDown(e)}
				>
					<g transform='rotate(270)'>
						<circle fill='#666666' cx='11.5' cy='11.5' r='11.5' />
						<path
							d='M18,11.5772265 C18,11.3035963 17.8970903,11.062158 17.6912709,10.8529114 L17.0654685,10.2493154 C16.8540864,10.0454341 16.6009842,9.94349348 16.3061617,9.94349348 C16.0057766,9.94349348 15.7554557,10.0454341 15.555199,10.2493154 L13.1020539,12.6073636 L13.1020539,6.94160967 C13.1020539,6.66261421 12.9977535,6.4359304 12.7891528,6.26155824 C12.580552,6.08718608 12.3288404,6 12.034018,6 L10.965982,6 C10.6711596,6 10.419448,6.08718608 10.2108472,6.26155824 C10.0022465,6.4359304 9.89794608,6.66261421 9.89794608,6.94160967 L9.89794608,12.6073636 L7.44480103,10.2493154 C7.24454429,10.0454341 6.99422336,9.94349348 6.69383825,9.94349348 C6.39345315,9.94349348 6.14313222,10.0454341 5.94287548,10.2493154 L5.31707317,10.8529114 C5.10569106,11.0567927 5,11.298231 5,11.5772265 C5,11.8615873 5.10569106,12.1057083 5.31707317,12.3095896 L10.7490372,17.5488023 C10.9437313,17.7473183 11.1940522,17.8465763 11.5,17.8465763 C11.8003851,17.8465763 12.0534874,17.7473183 12.2593068,17.5488023 L17.6912709,12.3095896 C17.8970903,12.100343 18,11.856222 18,11.5772265 Z'
							fill='#FFFFFF'
							fill-rule='nonzero'
						/>
					</g>
				</g>
			</g>
		</g>
	);
}

export * from './panel.tsx';
