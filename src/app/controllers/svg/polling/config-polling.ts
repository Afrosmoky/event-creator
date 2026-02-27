import API from "@/app/api/API";
import { createPolling, SvgDrawerContextType } from "@/app/context/SvgDrawerContext";

export function createConfigPolling(
    ballroomId: () => string,
    canvas: SvgDrawerContextType,
) {
    let lastConfig: API.Config | null = null;
	let isFirst = true;

	function updateConfig(config: API.Config) {
		if(lastConfig && config.canvas_width === lastConfig.canvas_width && config.canvas_height === lastConfig.canvas_height) {
			return;
		}

		canvas.modifyCanvasSize(config.canvas_width, config.canvas_height, false);
		if(isFirst) {
			canvas.zoomToFit();
			isFirst = false;
		}
		
		lastConfig = config;
	}
    
    createPolling(
        () => API.get_config(ballroomId()),
        3000,
        (data) => updateConfig(data)
    );
}
