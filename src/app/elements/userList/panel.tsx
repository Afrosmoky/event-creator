import { untrack, For, Show } from 'solid-js';

export function PanelGuest(props: any) {
  const store = untrack(() => props.store.userList);

  return (
    <div class="w-2/6 mx-auto p-6 bg-gray-100 border border-gray-300 rounded-lg shadow-md">
      <Show when={!store.loading && !store.error} fallback={<p class="text-center text-gray-500">Ładowanie...</p>}>
        {store.error ? (
          <p class="text-center text-red-500">Błąd: {store.error.message}</p>
        ) : (
          <ul class="space-y-4">
            <For each={store.data}>
              {(user: any) => (
                <li class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <p class="text-lg font-semibold text-gray-800">
                    <strong>Imię i nazwisko:</strong> {user.person.name} {user.person.surname}
                  </p>
                  <p class="text-gray-700">
                    <strong>Grupa wiekowa:</strong> {user.person.age_group}
                  </p>
                  <p class="text-gray-700">
                    <strong>Grupa:</strong> {user.person.group_name}
                  </p>
                </li>
              )}
            </For>
          </ul>
        )}
      </Show>
    </div>
  );
}