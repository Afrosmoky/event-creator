import API from "@/app/api/API";
import { createPolling, getDiff, SvgDrawerContextType } from "@/app/context/SvgDrawerContext";
import { BiMap } from "../utils";
import { createSeatFromBackend, decodeBackendSeat } from "../adapters/seat";

export function createSeatPolling(
    ballroomId: () => string,
    canvas: SvgDrawerContextType,
	seatIdMap: BiMap<number, number>,
	removedSeats: Map<number, boolean>
) {
    let lastState: Record<string, API.Seat> | null = null;

    function updateItems(seats: API.Seat[]) {
			const state: Record<string, API.Seat> = {};
			for(const key in seats) {
				state[key] = seats[key];
			}
	
			const diff = lastState ? getDiff(lastState, state) : state;
			if(!diff) {
				return;
			}
	
			console.log(`==== SEATS DIFF ====`);
			console.log(diff);
	
			for(const key in diff) {
				const backendId = parseInt(key);
				const clientId = seatIdMap.getKey(backendId);
				const value = diff[key];
	
				if(!value) {
					if(clientId === undefined) {
						continue;
					}
	
					canvas.removeSeat(clientId, false);
					seatIdMap.deleteByKey(clientId);
				} else if(clientId == undefined || clientId == null) {
					if(removedSeats.has(backendId)) {
						console.warn(`Won't create server seat ${backendId}, it's already deleted`);
						continue;
					}
	
					const seat = canvas.addSeat(0, createSeatFromBackend(value), false);
					seatIdMap.set(seat.id, backendId);
				} else {
					const clientDiff = decodeBackendSeat(value);
					delete clientDiff.id;
	
					canvas.modifySeat(clientId, clientDiff, false);
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
