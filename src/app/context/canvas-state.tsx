import type { ParentProps } from 'solid-js';
import { createMutable } from 'solid-js/store';
import { useContext, createEffect, createContext } from 'solid-js';
import { apiQuery } from '../api/apiQuery';
import { useApiMutation } from '../api/useApiMutation';
import type * as rfc6902 from '@/rfc6902';
import { debounce } from 'lodash-es';
// @ts-ignore
import type { BaseState } from '@/app/state';
import type { AnyState } from '@/app/elements';
import { unwrapStore } from '@/app/utils';
import { useParams } from '@solidjs/router';
import { mapFromBackendFormat, mapToBackendEditFormat } from './helpers';
export interface CanvasContext {
  state: AnyState[];
  userList: {
    data: string[];
    loading: boolean;
    error: any;
    refetch: () => void;
  };
  //focus: AnyState | null;
  dragFocus: AnyState | null;
  uiFocus: AnyState | null;
  //prevFocus: BaseState | null;
  history: rfc6902.Patch[];
  prevState: AnyState[];
  overlay: boolean;
  isDragging: boolean;
  canvasRef: SVGSVGElement | HTMLDivElement | null,
  menu: boolean;
  refetchElements: () => Promise<void>;
  focusAndUpdateElement: (el: AnyState) => Promise<void>;
}
// @ts-ignore
let ballroomId = 1;

const CanvasStateContext = createContext<CanvasContext>();

export function useCanvasState(): CanvasContext {
  const context = useContext(CanvasStateContext);
  if (context === undefined) {
    throw new Error('CanvasStateContext not found');
  }
  return context;
}




export function createCanvasState(): CanvasContext {
  const params = useParams();
  const { id } = params;

  const { data: guestData, refetch: refetchGuest } = apiQuery<{ name: string }>({
    route: 'GUEST',
    id: id,
  });

  const { data: elementsData, refetch: refetchElementsQuery } = apiQuery<any[]>({
    route: 'GET_ELEMENTS'
  });

  const { mutate } = useApiMutation();

  let initialState: AnyState[] = [];
  let initialHistory: rfc6902.Patch[] = [];

  /*const persisted = localStorage.getItem('canvas-state');
  if (persisted) {
    try {
      initialState = JSON.parse(persisted);
    } catch (e) {
      console.error('Nie można sparsować canvas-state z localStorage', e);
    }
  }

  const persistedHistory = localStorage.getItem('canvas-history');
  if (persistedHistory) {
    try {
      initialHistory = JSON.parse(persistedHistory);
    } catch (e) {
      console.error('Nie można sparsować canvas-history z localStorage', e);
    }
  }*/

  const store = createMutable<CanvasContext>({
    state: initialState,
    userList: {
      data: [],
      loading: true,
      error: null,
      refetch: () => {},
    },
    history: initialHistory,
    //focus: null,
    dragFocus:  null,
    uiFocus:  null,
    //prevFocus: null,
    isDragging: false,
    canvasRef: null,
    prevState: unwrapStore(initialState),
    overlay: false,
    menu: false,
    refetchElements: async () => {
      try {
        const response = await refetchElementsQuery();
        // @ts-ignore
        if (Array.isArray(response)) {
          // @ts-ignore
          const mapped = response.map(mapFromBackendFormat);
          store.state = mapped;
          store.prevState = unwrapStore(mapped);
          store.history = [];
          localStorage.setItem('canvas-state', JSON.stringify(store.state));
          localStorage.setItem('canvas-history', JSON.stringify(store.history));
          console.log('[CanvasState] Elements refetched and updated');
        }
      } catch (error) {
        console.error('[CanvasState] Failed to refetch elements', error);
      }
    },
    // focusAndUpdateElement: async (el: AnyState) => {
    //   try {
    //     const payload = mapToBackendEditFormat(el);
    //
    //     const response = await mutate(
    //       {
    //         route: 'UPDATE_ELEMENT',
    //         method: 'PUT',
    //         id: el.id,
    //       },
    //       payload
    //     );
    //
    //     const newId = response?.data?.id;
    //     if (!newId) throw new Error('Brak id w odpowiedzi z backendu');
    //
    //     await store.refetchElements();
    //
    //     const updated = store.state.find((e) => e.id === newId);
    //     if (updated) {
    //       updated.focus = true;
    //       store.focus = updated;
    //       localStorage.setItem('canvas-state', JSON.stringify(store.state));
    //     } else {
    //       console.warn('Nie znaleziono nowego elementu po ID:', newId);
    //     }
    //   } catch (err) {
    //     console.error('Błąd przy dodawaniu elementu:', err);
    //   }
    // },
    focusAndUpdateElement: async (el: AnyState) => {
      try {
        const payload = mapToBackendEditFormat(el);

        const response = await mutate(
            {
              route: 'UPDATE_ELEMENT',
              method: 'PUT',
              // @ts-ignore
              id: el.id,
            },
            payload
        );
// @ts-ignore
        const backendElement = response;
        if (!backendElement) {
          console.warn('Backend nie zwrócił danych — zostawiam lokalny element bez refetcha.');
          return;
        }

        // zamiana na format frontendowy
        const mapped = mapFromBackendFormat(backendElement);

        // podmiana tylko jednego elementu
        // @ts-ignore
        const idx = store.state.findIndex(e => e.id === mapped.id);
        if (idx !== -1) {
          store.state[idx] = mapped;
        } else {
          // jeśli to zupełnie nowy element
          store.state.push(mapped);
        }

        // ustawienie focus
        mapped.focus = true;
        store.dragFocus = mapped;

        localStorage.setItem('canvas-state', JSON.stringify(store.state));
      } catch (err) {
        console.error('Błąd przy dodawaniu elementu:', err);
      }
    },
  });

  createEffect(() => {
    // @ts-ignore
    store.userList.data = guestData() || [];
    store.userList.loading = guestData.loading;
    store.userList.error = guestData.error;
    store.userList.refetch = refetchGuest;
  });
// @ts-ignore
  let initialized = false;
  let hydrated = false;
  //let isDragging = false;

  // createEffect(() => {
  //   if (initialized) return;
  //   const raw = elementsData();
  //   if (!raw) return;
  //
  //   const newElements = raw.map(mapFromBackendFormat);
  //   if (newElements.length > 0) {
  //     store.state = newElements;
  //     store.prevState = unwrapStore(newElements);
  //     store.history = [];
  //     localStorage.setItem('canvas-state', JSON.stringify(store.state));
  //     localStorage.setItem('canvas-history', JSON.stringify(store.history));
  //     console.log('[CanvasState] Elements initially loaded');
  //     initialized = true;
  //     hydrated = true;
  //   }
  // });

  createEffect(() => {
    const raw = elementsData();
    if (!raw) return;
    // @ts-ignore
    console.log('[CanvasState] backend raw count', raw.length, raw.map(r => r.id));
    // @ts-ignore
    const newElements = raw.map(mapFromBackendFormat);
    // @ts-ignore
    console.log('[CanvasState] mapped ids from backend', newElements.map(e => e.id));
    store.state = newElements;
    store.prevState = unwrapStore(newElements);
    store.history = [];

    hydrated = true;  // ← Ten jeden wiersz uruchamia PUT-y
  });
// @ts-ignore
  const sendFocusedUpdate = debounce(async (el: AnyState) => {
    if (!hydrated) return;
    if (store.isDragging) return;
    try {
      // @ts-ignore
      console.log('[sendFocusedUpdate] sending update for id', el.id, 'payload x,y', el.x, el.y);
      const payload = mapToBackendEditFormat(el);
      await mutate({
        route: 'UPDATE_ELEMENT',
        method: 'PUT',
        // @ts-ignore
        id: el.id,
      }, payload);
      console.log('Zaktualizowano element:', payload);
      //await store.refetchElements();
    } catch (err) {
      console.error('Błąd podczas aktualizacji elementu:', err);
    }
  }, 500);

  // createEffect(() => {
  //   const focused = store.state.find((el) => el.focus);
  //   if (!focused) return;
  //
  //   createEffect(() => {
  //     const deps = [
  //       focused.name, focused.x, focused.y, focused.id, focused.color,
  //       focused.angle, focused.angleOriginX, focused.angleOriginY,
  //       focused.config?.width, focused.config?.height, focused.config?.radius,
  //       focused.config?.size, focused.config?.type, focused.config?.icon,
  //       focused.config?.seats,
  //     ];
  //
  //     sendFocusedUpdate(focused);
  //   });
  // });

  // createEffect(() => {
  //   const focused = store.state.find(el => el.focus);
  //   if (!focused) return;
  //   if (!hydrated) return;
  //   if (store.isDragging) return;
  //
  //   // trackowane pola — Solid zarejestruje zmiany
  //   focused.x;
  //   focused.y;
  //   focused.angle;
  //   focused.color;
  //
  //   if (focused.config) {
  //     focused.config.width;
  //     focused.config.height;
  //     focused.config.radius;
  //     focused.config.size;
  //     focused.config.seats;
  //   }
  //
  //   //sendFocusedUpdate(focused);
  // });

  // createEffect(() => {
  //   localStorage.setItem('canvas-state', JSON.stringify(store.state));
  //   localStorage.setItem('canvas-history', JSON.stringify(store.history));
  // });

  // createEffect(() => {
  //   const raw = elementsData();
  //   if (!raw) return;
  //
  //   const mapped = raw.map(mapFromBackendFormat);
  //   store.state = mapped;
  //
  //   // tutaj, i TYLKO tutaj zapisujemy snapshot
  //   localStorage.setItem("canvas-state", JSON.stringify(mapped));
  // });
  // @ts-ignore
  window.__canvas = store;
  return store;
}



interface CanvasStateProviderProps extends ParentProps {
  store: CanvasContext;
}

export function CanvasStateProvider(props: CanvasStateProviderProps) {
  return (
    <CanvasStateContext.Provider value={props.store}>
      {props.children}
    </CanvasStateContext.Provider>
  );
}

