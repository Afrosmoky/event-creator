import API from "@/app/api/API";
import { createPolling, getDiff, SvgDrawerContextType } from "@/app/context/SvgDrawerContext";
import { createSeatFromBackend, decodeBackendSeat } from "../adapters/seat";

export function createSeatPolling(
    ballroomId: () => string,
    canvas: SvgDrawerContextType,
) {
    let lastState: Record<string, API.Seat> | null = null;

    function updateItems(seats: API.Seat[]) {
		const state: Record<string, API.Seat> = {};
		for(const seat of seats) {
			state[seat.id] = seat;
		}

		const diff = lastState ? getDiff(lastState, state) : state;
		if(!diff) {
			return;
		}

		console.log(`==== SEATS DIFF ====`);
		console.log(diff);

		for(const key in diff) {
			const id = parseInt(key);
			const value = diff[key];

			if(!value) {
				canvas.removeSeat(id, false);
			} else if(!canvas.seatsMap[id]) {
				const local = createSeatFromBackend(value);
				console.log(`Seat ${id} created from backend: `);
				canvas.addSeat(id, local, false);
			} else {
				const local = decodeBackendSeat(value);
				canvas.modifySeat(id, local, false);
			}
		}

		lastState = state;
	}
    
    createPolling(
        () => API.get_seats(ballroomId()),
        3000,
        (data) => updateItems(data)
    );
}
