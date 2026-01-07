import API from "@/app/api/API";
import { applyDiff, createPolling, getDiff, SvgDrawerContextType } from "@/app/context/SvgDrawerContext";
import { batch } from "solid-js";
import { createGuestFromBackend, decodeBackendGuest } from "../adapters/guest";
import { produce } from "solid-js/store";

export function createGuestPolling(
    ballroomId: () => string,
    canvas: SvgDrawerContextType
) {
    function updateItems(guests: API.Guest[]) {
		const state: Record<string, API.Guest> = {};
		for(const guest of guests) {
			state[guest.guest_id] = guest;
		}

		batch(() => {
			// remove non existing guests
			for(const existing of canvas.guests) {
				const backendGuest = state[existing.id];
				if(!backendGuest) {
					canvas.setGuests(prev => prev.filter(o => o.id != existing.id));
				}
			}

			for(const key in state) {
				const backendGuest = state[key];

				const existingIndex = canvas.guests.findIndex(o => o.id === backendGuest.guest_id);
				if(existingIndex != -1) {
					const clientGuest = decodeBackendGuest(backendGuest);
					const diff = getDiff(canvas.guests[existingIndex], clientGuest);
					if(!diff) {
						return;
					}

					canvas.setGuests(existingIndex, produce(guest => {
						applyDiff(guest, diff);
					}));
				} else {
					const clientGuest = createGuestFromBackend(backendGuest);
					canvas.setGuests(canvas.guests.length, clientGuest);
				}
			}
		});
	}
    
    createPolling(
        () => API.get_guests(ballroomId()),
        3000,
        (data) => updateItems(data)
    );
}
