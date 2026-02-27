import { ConfigPatch, createPatchSync, GuestPatch, mergePatchArray, SvgDrawerContextType } from "@/app/context/SvgDrawerContext";
import API from "@/app/api/API";

export function createConfigSync(
    ballroomId: () => string,
    canvas: SvgDrawerContextType
) {
    async function sendPatch(patch: ConfigPatch) {
        if(patch.type != "mod") {
            console.warn('Invalid patch for config');
            return;
        }

        console.log(`Sending ${patch.type} patch for config ${patch.id} with values: `);
        console.log(patch.value);

        try {
            await API.update_config(
                ballroomId(),
                {
                    canvas_width: patch.value.width ?? undefined,
                    canvas_height: patch.value.height ?? undefined
                }
            );
        } catch(error) {
            console.error("Failed to send config patch");
            console.error(error);
        }
    }

    createPatchSync(
        () => canvas.configPatches,
        async (patches) => {
            const merged = mergePatchArray(patches);

            console.log(`Merged config patches: `);
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