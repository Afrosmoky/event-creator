import { SvgDrawerContextType } from "@/app/context/SvgDrawerContext";
import { createItemSync } from "../sync/item-sync";
import { createItemPolling } from "../polling/item-polling";

export function createItemController(
    ballroomId: () => string,
    canvas: SvgDrawerContextType
) {
    createItemSync(ballroomId, canvas);
    createItemPolling(ballroomId, canvas);
}