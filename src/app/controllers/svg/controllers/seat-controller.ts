import { SvgDrawerContextType } from "@/app/context/SvgDrawerContext";
import { createSeatSync } from "../sync/seat-sync";
import { createSeatPolling } from "../polling/seat-polling";

export function createSeatController(
    ballroomId: () => string,
    canvas: SvgDrawerContextType
) {
    createSeatSync(ballroomId, canvas);
    createSeatPolling(ballroomId, canvas);
}