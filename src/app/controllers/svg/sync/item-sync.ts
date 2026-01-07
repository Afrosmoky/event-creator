import { createPatchSync, mergePatchArray, Patch, SvgDrawerContextType } from "@/app/context/SvgDrawerContext";
import { encodeClientItem } from "../adapters/item";
import API from "@/app/api/API";

export function createItemSync(
    ballroomId: () => string, 
    canvas: SvgDrawerContextType
) {
    async function sendPatch(patch: Patch) {
        console.log(`Sending ${patch.type} patch for item ${patch.id} with values: `);
        console.log(patch.type === "mod" ? patch.value : patch.item);

        if(patch.type === "mod") {
            const item = canvas.items[patch.id];
            if(!item) {
                console.warn('Wanted to send mod patch but ITEM no longer exists');
                return;
            }

            const backend = encodeClientItem(item); // need to encode entire item

            backend.ballroom_id = ballroomId();
            backend.status = "active";
            backend.spacing = item.props?.seat_spacing ?? 0;

            await API.update_element(patch.id, backend);
        } else if(patch.type === "add") {
            const backend = encodeClientItem(patch.item);

            backend.ballroom_id = ballroomId();
            backend.status = "active";

            const data = await API.add_element(backend);
            const backendId = data.id;

            canvas.changeItemId(patch.id, backendId);
        } else if(patch.type === "del") {
            await API.delete_element(patch.id);
        }
    }
    
    createPatchSync(
        () => canvas.patches,
        async (patches) => {
            const merged = mergePatchArray(patches);

            console.log(`Merged element patches: `);
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
    );
}

