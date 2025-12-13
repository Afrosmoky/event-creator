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

import { calculateSquareDotPositions } from './math.ts';

export interface SquareTableState extends BaseState, WithSeatsState, WithRotationState {
  kind: 'square-table';
  config: {
    type: 'square';
    width: number;
    height: number;
  } | {
    type: 'circle';
  };
}

export interface SquareTableProps extends BaseCanvasProps<SquareTableState> {}

export function SquareTable(props: SquareTableProps) {
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
    anchor: SVGGElement;
    stick: SVGGElement;
    chairs: SVGGElement;
  }>(
    zoomController,
    {},
      // @ts-ignore
    (reload, event, element, zoom, deltaX, deltaY, storage) => {
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
      const dx = deltaX * Math.cos(angle) - deltaY * Math.sin(angle);
      const dy = deltaX * Math.sin(angle) + deltaY * Math.cos(angle);

      const rawWidth = reload
          // @ts-ignore
        ? store.config.width
        : +(storage.rect.getAttribute('width') ?? 0) + dx;

      const rawHeight = reload
          // @ts-ignore
        ? store.config.height
        : +(storage.rect.getAttribute('height') ?? 0) - dy;

      const width = setAttributeForwawrd(
        storage.rect,
        'width',
        _ => Math.max(40, rawWidth),
      );

      const height = setAttributeForwawrd(
        storage.rect,
        'height',
        _ => Math.max(40, rawHeight),
      );

      if (!reload) {
        mutate(store.config, { width, height });
      }

      storage.anchor.setAttribute(
        'transform',
        `translate(${width}, -${height})`
      );

      const positions = calculateSquareDotPositions(
        width,
        height,
        store.spacing - 1,
        store.spacing,
      );

      store.seats = positions.length;

      if (storage.chairs.children.length !== positions.length) return;

      for (const element of storage.chairs.children) {
        const chair = element as SVGGElement;
        const index = +chair.dataset.index!;
        const [x, y] = positions[Math.abs(positions.length - index - 1)];
        chair.style.transform = `translate(${x}px, ${-y}px)`;
      }

      store.angleOriginX = width / 2;
      store.angleOriginY = height / 2;
    },
  );

  createEffect(() => moveController.move(store.x, store.y));

  createEffect(on(
    [
      () => store.seats,
      () => store.spacing,
        // @ts-ignore
      () => store.config.width,
        // @ts-ignore
      () => store.config.height,
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
            console.log("Element:", context.dragFocus);

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
          transform: `rotate(${store.angle}deg)`,
          'transform-origin': `0px 0px`,
        }}
      >
        <rect
            // @ts-ignore
          y={-store.config.height}
            // @ts-ignore
          width={store.config.width}
            // @ts-ignore
          height={store.config.height}
          fill={store.color}
          ref={ref => resizeController.storage.rect = ref}
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

        {/* Obracanie */}
        <g
          ref={ref => resizeController.storage.stick = ref}
          transform={`translate(-11.5, ${32 / 2 - 11.5})`}
          on:pointerup={async e => {
              const el = context.dragFocus;
              if (el) await context.focusAndUpdateElement(el);
              context.dragFocus = null;
              resizeController.handlePointerUp(e);

          }}
          on:pointerdown={e => {
              context.dragFocus = store;
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

          on:pointerup={async e => {
              resizeController.handlePointerUp(e);
              const el = context.dragFocus;
              if (el) await context.focusAndUpdateElement(el);
              context.dragFocus = null;
          }}
          on:pointerdown={e => {
              context.dragFocus = store;
              //console.log(resizeController.storage.anchor);
              // Tutaj zapis scrolowania elementu
              resizeController.handlePointerDown(e)
          }}
        >
          <g transform='rotate(225)'>
            <circle fill='#666666' cx='11.5' cy='11.5' r='11.5' />
            <path
              d='M18,11.5772265 C18,11.3035963 17.8970903,11.062158 17.6912709,10.8529114 L17.0654685,10.2493154 C16.8540864,10.0454341 16.6009842,9.94349348 16.3061617,9.94349348 C16.0057766,9.94349348 15.7554557,10.0454341 15.555199,10.2493154 L13.1020539,12.6073636 L13.1020539,6.94160967 C13.1020539,6.66261421 12.9977535,6.4359304 12.7891528,6.26155824 C12.580552,6.08718608 12.3288404,6 12.034018,6 L10.965982,6 C10.6711596,6 10.419448,6.08718608 10.2108472,6.26155824 C10.0022465,6.4359304 9.89794608,6.66261421 9.89794608,6.94160967 L9.89794608,12.6073636 L7.44480103,10.2493154 C7.24454429,10.0454341 6.99422336,9.94349348 6.69383825,9.94349348 C6.39345315,9.94349348 6.14313222,10.0454341 5.94287548,10.2493154 L5.31707317,10.8529114 C5.10569106,11.0567927 5,11.298231 5,11.5772265 C5,11.8615873 5.10569106,12.1057083 5.31707317,12.3095896 L10.7490372,17.5488023 C10.9437313,17.7473183 11.1940522,17.8465763 11.5,17.8465763 C11.8003851,17.8465763 12.0534874,17.7473183 12.2593068,17.5488023 L17.6912709,12.3095896 C17.8970903,12.100343 18,11.856222 18,11.5772265 Z'
              fill='#FFFFFF'
              fill-rule='nonzero'
            />
          </g>
        </g>

        <text
          text-anchor='middle'
          dominant-baseline='middle'
            // @ts-ignore
          x={store.config.width / 2}
            // @ts-ignore
          y={-store.config.height / 2}
          font-size='20'
          fill='blue'
        >
          {store.name}
        </text>
      </g>
    </g>
  );
}

export * from './panel.tsx';
