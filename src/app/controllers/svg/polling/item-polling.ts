import API from "@/app/api/API";
import { createPolling, getDiff, SvgDrawerContextType } from "@/app/context/SvgDrawerContext";
import { createItemFromBackend, decodeBackendElement } from "../adapters/item";

export function createItemPolling(
    ballroomId: () => string,
    canvas: SvgDrawerContextType
) {
    let lastState: Record<string, API.Element> | null = null;

    function updateItemsFromServer(items: API.Element[]) {
		const state: Record<string, API.Element> = {};
		for(const item of items) {
			state[item.id] = item;
		}

		const itemDiff = lastState ? getDiff(lastState, state) : state;
		if(!itemDiff) {
			return;
		}

		console.log(`==== ITEMS DIFF ====`)
		console.log(itemDiff);

		for(const key in itemDiff) {
			const id = parseInt(key);
			const value = itemDiff[key];

			if(!value) {
				canvas.removeItem(id, false);
			} else if(!canvas.items[id]) { // add
				canvas.addItem(id, createItemFromBackend(value), false);
			} else { // mod
				const localDiff = decodeBackendElement(value);
				if(!localDiff) {
					continue;
				}

				const localItem = canvas.items[id];
				const lastUpdate = new Date(value.updated_at ?? 0).getTime() + (60 * 60 * 1000);

				if(localItem.last_update > lastUpdate) {
					console.warn("Wanted to update from server, but client is newer");
					console.log(localDiff);

					console.log(`Client: ${new Date(localItem.last_update)}`)
					console.log(`Server: ${new Date(lastUpdate)}`)
					continue;
				}

				console.log(`Detected diff for item ${id}: `);
				console.log(localDiff);
				
				canvas.modifyItem(id, localDiff, false);
			}
		}

		lastState = state;
	}
    
    createPolling(
        () => API.get_elements(ballroomId()),
        3000,
        (data) => updateItemsFromServer(data)
    );
}
