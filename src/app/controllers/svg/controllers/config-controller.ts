import { SvgDrawerContextType } from "@/app/context/SvgDrawerContext";
import { createConfigSync } from "../sync/config-sync";
import { createConfigPolling } from "../polling/config-polling";

export function createConfigController(
    ballroomId: () => string,
    canvas: SvgDrawerContextType
) {
    createConfigSync(ballroomId, canvas);
    createConfigPolling(ballroomId, canvas);
}