import { For, untrack } from 'solid-js';
import { isWebKit } from '@solid-primitives/platform';
// @ts-ignore
import { apiQuery } from '../../../../api/apiQuery';
import type { AnyState } from '@/app/elements';
import type { ZoomController } from '@/app/controllers';
import { Icon } from '@/components/Icon';
import { SPRITES_META } from '@/sprite.gen';
import { useCanvasState } from '@/app/context';
import { DragController } from '@/app/controllers';
import { iconTranslations } from '@/app/constants';
import { useApiMutation } from '../../../../api/useApiMutation';
import { mapToBackendCreateFormat ,mapFromBackendFormat} from '@/app/context/helpers';
// @ts-ignore
import { createEffect } from 'solid-js';
export interface AddItemMenuProps {
  zoomController: ZoomController;
}

export function AddItemMenu(props: AddItemMenuProps) {
  const zoomController = untrack(() => props.zoomController);
  const store = useCanvasState();
  //store.isDragging = true;
  const { mutate } = useApiMutation();

  // const { data: elementsData, refetch: refetchElementsQuery } = apiQuery<any[]>({
  //   route: 'GET_ELEMENTS',
  // });

  // createEffect(() => {
  //   if (!store.state.length && elementsData()) {
  //     store.state = elementsData().map(mapFromBackendFormat);
  //   }
  // });

  async function saveElementToBackend(el: AnyState) {
    const payload = mapToBackendCreateFormat(el);
    console.log('[AddItemMenu] Payload that goes to backend', payload);
    return await mutate({ route: 'ADD_ELEMENTS', method: 'POST' }, payload);
  }

  function initNewState(e: PointerEvent, state: AnyState) {
    state.upHook = () => {
      store.overlay = false;
      state.upHook = undefined;
    };
    store.overlay = true;
    if (isWebKit) {
      store.menu = false;
    }
    store.isDragging = true;
    const rect = store.canvasRef!.getBoundingClientRect();

    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

// ustaw pozycję nowego elementu tam, gdzie jest realnie kursor
    state.x = canvasX;
    state.y = canvasY;
    state.startMoving?.({
      clientX: e.clientX,
      clientY: e.clientY,
      pointerId: e.pointerId,
    });
  }

  function generateState(item: keyof typeof SPRITES_META, e: PointerEvent): AnyState {
    // compute canvas-local coordinates using zoomController
    const x = (e.clientX - (zoomController.panX ?? 0)) / (zoomController.zoom ?? 1);
    const y = (e.clientY - (zoomController.panY ?? 0)) / (zoomController.zoom ?? 1);
    const canvasEl = store.canvasRef;

    // fallback gdy canvasRef nie jest jeszcze gotowy
    const rect = canvasEl?.getBoundingClientRect?.() ?? { left: 0, top: 0 };

    // zoomController nie posiada canvas, ale posiada zoom i pan
    const zoom = zoomController?.zoom ?? 1;
    const panX = zoomController?.panX ?? 0;
    const panY = zoomController?.panY ?? 0;

    // realne współrzędne kursora względem canvas + pan/zoom
    const xCanvas = (e.clientX - rect.left - panX) / zoom;
    const yCanvas = (e.clientY - rect.top - panY) / zoom;

    const common = {
      name: 'test',
      x,
      y,
      color: '#bd50bd',
      focus: false,
      index: store.state.length,
      id: undefined as unknown as number | string | undefined, // new local object: no id yet
    };

    switch (item) {
      case 'round-table':
        return {
          ...common,
          kind: 'table',
          seats: 30,
          config: { type: 'circle', radius: 90 },
          spacing: 40,
          angle: 0,
          angleOriginX: 90,
          angleOriginY: 90,
        } as AnyState;
      case 'square-table':
        return {
          ...common,
          kind: 'square-table',
          seats: 30,
          config: { type: 'square', width: 256, height: 256 },
          spacing: 50,
          angle: 0,
          angleOriginX: 128,
          angleOriginY: 128,
        } as AnyState;
      case 't-table':
        return {
          ...common,
          kind: 't-table',
          seats: 30,
          config: { type: 't-table', width: 256, height: 256 },
          spacing: 40,
          angle: 0,
          angleOriginX: 128,
          angleOriginY: 128,
        } as AnyState;
      case 'u-table':
        return {
          ...common,
          kind: 'u-table',
          seats: 30,
          config: { type: 'u-table', width: 200, height: 200 },
          spacing: 40,
          angle: 0,
          angleOriginX: 100,
          angleOriginY: 100,
        } as AnyState;
      case 'long-table':
        return {
          ...common,
          kind: 'long-table',
          seats: 30,
          config: { type: 'long', width: 500, height: 256 },
          spacing: 40,
          angle: 0,
          angleOriginX: 250,
          angleOriginY: 128,
        } as AnyState;
      case 'row-of-chairs': return { ...common, kind: 'chairs', seats: 30, config: { width: 256 }, angle: 0, angleOriginX: 0, angleOriginY: 0, spacing: 40 };
      default:
        // @ts-ignore
        const { width, height } = SPRITES_META[item];
        return {
          ...common,
          kind: 'icon',
          config: { size: 256, icon: item },
          angle: 0,
          angleOriginX: 0,
          angleOriginY: 0,
          x: xCanvas - width / 2,
          y: yCanvas - height / 2,
        };
    }
  }

  return (
    <div class="grid grid-cols-3 overflow-x-hidden overflow-y-scroll scrollbar-hidden h-[400px] [&>*>svg]:w-available [&>*>svg]:aspect-square [&>*]:text-center border-t-1 border-l-1 [&>*]:border-b-1 [&>*]:border-r-1 [&>*]:p-3 [&>*]:text-sm">
      <For each={Object.keys(SPRITES_META) as (keyof typeof SPRITES_META)[]}>
        {(item) => {
          const dragController = new DragController(async (e) => {
            const tempId = `temp-${Date.now()}`;
            const initial = generateState(item, e);
            // @ts-ignore
            initial.id = tempId;

            try {
              // najpierw zapisujemy do backendu
              console.log('[AddItemMenu] creating element local initial:', initial); // przed wysłaniem

              const response = await saveElementToBackend(initial);
              let created = null;
              // @ts-ignore
              console.log('[AddItemMenu] backend response', response?.data);
              // @ts-ignore
              if (!response?.data) {
                console.error("Backend nie zwrócił elementu – nie można dodać.");
                return;
              }

              // mapowany backendowy element z prawdziwym ID
              // @ts-ignore
              if (response?.data) {
                // @ts-ignore
                created = mapFromBackendFormat(response.data);
              } else {
                created = initial;
              }

              // dodajemy DO store dopiero PO otrzymaniu prawdziwego ID:
              // @ts-ignore
              console.log('[AddItemMenu] BEFORE push store ids', store.state.map(s => s.id));

              store.state.push(created);
              created.focus = true;
              //store.focus = created;

              // 🔥 1. MUSIMY ZSYNCHRONIZOWAĆ MoveController Z POZYCJĄ ELEMENTU
              //    (żeby nie ruszał się z offsetem)
// @ts-ignore
              console.log('[AddItemMenu] AFTER push store ids', store.state.map(s => s.id));
              //created.focus = true;
              //store.focus = created;

              // zaczynamy drag
              initNewState(e, created);
              await new Promise(requestAnimationFrame);

              // 4) Jeśli komponent podpiął startMoving — uruchom go teraz (to rozpocznie MoveController bez offsetu)
              // @ts-ignore
              // if (typeof created.startMoving === 'function') {
                // @ts-ignore
                (created as any).startMoving?.({ clientX: e.clientX, clientY: e.clientY, pointerId: e.pointerId });

              // } else {
              //   // safety fallback: spróbuj jeszcze raz w microtask (jeżeli mount opóźniony)
              //   await new Promise(resolve => setTimeout(resolve, 0));
              //   // @ts-ignore
              //   created.startMoving?.({
              //     clientX: e.clientX,
              //     clientY: e.clientY,
              //     pointerId: e.pointerId,
              //   });
              // }

            } catch (err) {
              console.error("Błąd podczas dodawania elementu:", err);
            }
          });

          return (
            <div
              onPointerDown={(e) => dragController.handlePointerDown(e)}
              onPointerMove={(e) => dragController.handlePointerMove(e)}
              onPointerUp={(e) => dragController.handlePointerUp(e)}
            >
              <div class="text-wrap flex justify-center">
                {iconTranslations[item] || item}
              </div>
              <Icon name={item} />
            </div>
          );
        }}
      </For>
    </div>
  );
}
