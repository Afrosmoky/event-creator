import { createPatchSync, GuestPatch, mergePatchArray, SvgDrawerContextType } from "@/app/context/SvgDrawerContext";
import API from "@/app/api/API";

export function createGuestSync(
    canvas: SvgDrawerContextType
) {
    async function sendPatch(patch: GuestPatch) {
        if(patch.type != "mod") {
            console.warn('Invalid patch for guest');
            return;
        }

        console.log(`Sending ${patch.type} patch for guest ${patch.id} with values: `);
        console.log(patch.value);

        try {
            await API.update_guest_note(
                patch.id,
                patch.value.note ?? ""
            );
        } catch(error) {
            console.error("Failed to send guest patch");
            console.error(error);
        }
    }

    createPatchSync(
        () => canvas.guestPatches,
        async (patches) => {
            const merged = mergePatchArray(patches);

            console.log(`Merged guest patches: `);
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