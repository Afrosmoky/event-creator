import { createPatchSync, mergePatchArray, SeatPatch, SvgDrawerContextType } from "@/app/context/SvgDrawerContext";
import { createBackendFromSeat, encodeClientSeat } from "../adapters/seat";
import API from "@/app/api/API";
import { BiMap } from "../utils";

export function createSeatSync(
    ballroomId: () => string,
    canvas: SvgDrawerContextType,
    seatIdMap: BiMap<number, number>,
    removedSeats: Map<number, boolean>
) {
    async function sendPatch(patch: SeatPatch) {
        console.log(`Sending ${patch.type} patch for seat ${patch.id} with values: `);
        console.log(patch.type === "mod" ? patch.value : patch.item);

        if(patch.type === "mod") {
            const seat = canvas.seatsMap[patch.id];
            if(!seat) {
                console.warn('Wanted to send mod patch but SEAT no longer exists');
                return;
            }

            if(!seatIdMap.hasKey(patch.id)) {
                console.warn(`Wanted to send MOD patch but SEAT ${patch.id} is not associated with backend`);
                return;
            }

            const backendId = seatIdMap.getValue(patch.id);
            const item = encodeClientSeat(seat);

            await API.update_seat(backendId, item);
        } else if(patch.type === "add") {
            const backend = createBackendFromSeat(patch.item);
            backend.ballroom_id = ballroomId();

            const data = await API.add_seat(backend);
            const backendId = data.id;

            seatIdMap.set(patch.id, backendId);
        } else if(patch.type === "del") {
            if(!seatIdMap.hasKey(patch.id)) {
                console.warn(`Wanted to send DEL patch for SEAT ${patch.id} but it's not associated with backend`);
                return;
            }

            const backendId = seatIdMap.getValue(patch.id);

            seatIdMap.deleteByKey(patch.id);
            removedSeats.set(backendId, true);

            await API.delete_seat(backendId);
        }
    }

    createPatchSync(
        () => canvas.seatPatches,
        async (patches) => {
            const merged = mergePatchArray(patches);

            console.log(`Merged seat patches: `);
            console.log(merged);

            for(const patch of merged) {
                try {
                    // @ts-ignore
                    await sendPatch(patch);
                } catch(error) {
                    console.error(error);
                }
            }
        }
    )
}