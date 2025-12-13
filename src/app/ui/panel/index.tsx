import { Button } from '@/components/Button';
import { useApiMutation } from '@/app/api/useApiMutation';
import { Show, Match, Switch } from 'solid-js';

import { useCanvasState } from '@/app/context';
// @ts-ignore
import { PanelIcon, PanelTable, PanelUTable, PanelTTable, PanelChairs, PanelLongTable, PanelSquareTable } from '@/app/elements';
import {mapToBackendEditFormat} from "@/app/context/helpers.tsx";

export function Panel() {
  const state = useCanvasState();
  const { mutate } = useApiMutation();
// @ts-ignore
  async function removeElementToBackend(el: AnyState) {
    if (!el || !el.id) {
      console.error('Nie można usunąć elementu: brak ID');
      return;
    }

    try {
      await mutate(
        {
          route: 'DELETE_ELEMENT',
          method: 'DELETE',
          id: el.id,
        }
      );
      console.log('Element usunięty:', el.id);

      // Wywołaj refetch po usunięciu elementu
      await state.refetchElements();
    } catch (err) {
      console.error('Błąd podczas usuwania elementu:', err);
    }
  }
// @ts-ignore
  async function updateElementToBackend(el: AnyState) {
    if (!el || !el.id) {
      console.error('Brak elementu do zapisu');
      return;
    }

    try {
      const payload = mapToBackendEditFormat(el);
      await mutate(
          {
            route: 'UPDATE_ELEMENT',
            method: 'PUT',
            id: el.id,
          },
          payload,
      );
      console.log('Element zaktualizowany:', el.id);

      // Wywołaj refetch po usunięciu elementu
      //await state.refetchElements();
    } catch (err) {
      console.error('Błąd podczas usuwania elementu:', err);
    }
  }

  return (
    <Show when={state.uiFocus}>
          <div class="flex flex-col w-[30%] min-w-[200px] h-full gap-2 pt-2 px-2 print:hidden [&>:first-child]:text-center">
            <div>
              <Switch>
                <Match when={// @ts-ignore
                  state.uiFocus.kind === 'table'}>Stół okrągły</Match>
                <Match when={// @ts-ignore
                  state.uiFocus.kind === 'square-table'}>Stół kwadratowy</Match>
                <Match when={// @ts-ignore
                  state.uiFocus.kind === 't-table'}>Stół w kształcie T</Match>
                <Match when={// @ts-ignore
                  state.uiFocus.kind === 'u-table'}>Stół w kształcie U</Match>
                <Match when={// @ts-ignore
                  state.uiFocus.kind === 'long-table'}>Stół prostokątny</Match>
                <Match when={// @ts-ignore
                  state.uiFocus.kind === 'chairs'}>Krzesła</Match>
                <Match when={// @ts-ignore
                  state.uiFocus.kind === 'icon'}>Ikonka</Match>
              </Switch>
            </div>

            <Switch fallback="unknown kind">
              <Match when={// @ts-ignore
                state.uiFocus.kind === 'table'}>
                <PanelTable store={state.uiFocus as any} />
              </Match>
              <Match when={// @ts-ignore
                state.uiFocus.kind === 'long-table'}>
                <PanelLongTable store={state.uiFocus as any} />
              </Match>
              <Match when={// @ts-ignore
                state.uiFocus.kind === 'square-table'}>
                <PanelSquareTable store={state.uiFocus as any} />
              </Match>
              <Match when={// @ts-ignore
                state.uiFocus.kind === 'chairs'}>
                <PanelChairs store={state.uiFocus as any} />
              </Match>
              <Match when={// @ts-ignore
                state.uiFocus.kind === 'icon'}>
                <PanelIcon store={state.uiFocus as any} />
              </Match>
              {/*<Match when={state.uiFocus.kind === 't-table'}>*/}
              {/*  <PanelTTable store={state.uiFocus as any} />*/}
              {/*</Match>*/}
              {/*<Match when={state.uiFocus.kind === 'u-table'}>*/}
              {/*  <PanelUTable store={state.uiFocus as any} />*/}
              {/*</Match>*/}
            </Switch>

            <Button
              onClick={async () => {
                console.log('Aktualny focus:', state.uiFocus);
                if (state.uiFocus) {
                  await removeElementToBackend(state.uiFocus);
                  // @ts-ignore
                  state.state = state.state.filter((el) => el.id !== state.uiFocus.id);
                  state.uiFocus = null;
                } else {
                  console.error('Brak wybranego elementu do usunięcia');
                }
              }}
            >
              Usuń
            </Button>
            <Button style="background-color: green;"
                onClick={async () => {
                  console.log('Aktualny focus:', state.uiFocus);
                  if (state.uiFocus) {
                    await updateElementToBackend(state.uiFocus);
                    //state.state = state.state.filter((el) => el.id !== state.uiFocus.id);
                    state.uiFocus = null;
                  } else {
                    console.error('Coś nie pykło z zapisem');
                  }
                }}
            >
              Zapisz
            </Button>
          </div>
    </Show>
  );
}