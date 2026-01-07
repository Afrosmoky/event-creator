import { createPatchSync, mergePatchArray, SeatPatch, SvgDrawerContextType } from "@/app/context/SvgDrawerContext";
import { createBackendFromSeat, encodeClientSeat } from "../adapters/seat";
import API from "@/app/api/API";

export function createSeatSync(
    ballroomId: () => string,
    canvas: SvgDrawerContextType
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

            const item = encodeClientSeat(seat);
            item.ballroom_id = ballroomId();

            await API.update_seat(patch.id, item);
        } else if(patch.type === "add") {
            const backend = createBackendFromSeat(patch.item);
            backend.ballroom_id = ballroomId();

            const data = await API.add_seat(backend);
            const backendId = data.id;

            canvas.changeSeatId(patch.id, backendId);
        } else if(patch.type === "del") {
            await API.delete_seat(patch.id);
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