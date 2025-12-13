import type { WithStoreProps } from '@/app/utils/types';
import type { ZoomController } from '@/app/controllers/zoom';

export type BaseCanvasProps<T = {}> = { zoomController: ZoomController } & WithStoreProps<T>;

export interface BaseState {
	name: string;
	x: number;
	y: number;
	color: string;
	focus: boolean;
	index: number;

	upHook?: () => void;
	startMoving?: (e: { clientX: number; clientY: number; pointerId: number }) => void;
}

export interface WithSeatsState {
	seats: number;
	spacing: number;
}

export interface WithRotationState {
	angle: number;
	angleOriginX: number;
	angleOriginY: number;
}
