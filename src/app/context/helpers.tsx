import type { AnyState } from '@/app/elements';

// export function mapFromBackendFormat(el: any): AnyState {
//   return {
//     id: el.id,
//     kind: el.kind,
//     name: el.name || 'Unnamed',
//     ballroom_id: el.ballroom_id,
//     parent_id: el.id,
//     index: el.index,
//     x: el.x ?? 0,
//     y: el.y ?? 0,
//     color: el.color || '#000000',
//     spacing: el.spacing ?? 30,
//     focus: el.focus || false,
//     config: {
//       width: el.config?.width ?? null,
//       height: el.config?.height ?? null,
//       radius: el.config?.radius ?? null,
//       size: el.config?.size ?? null,
//       type: el.config?.type ?? null,
//       icon: el?.icon ?? null,
//     },
//     seats: el.config?.seats ?? null,
//     angle: el.config?.angle ?? 0,
//     angleOriginX: el.config?.angle_origin_x ?? 0,
//     angleOriginY: el.config?.angle_origin_y ?? 0,
//   };
// }

export function mapFromBackendFormat(el: any): {
    id: number;
    kind: any;
    name: string;
    ballroom_id: any;
    parent_id: any;
    index: any;
    x: number;
    y: number;
    color: string;
    spacing: number;
    focus: boolean;
    seats: number;
    angle: number;
    angleOriginX: number;
    angleOriginY: number;
    config: { width: number; height: number; radius: number; size: number; type: any; icon: any }
} {
    // helper do parsowania liczb
    const num = (v: any, def = 0) =>
        v === null || v === undefined ? def : Number(v);

    // dopasowanie kind backend → frontend
    const kindMap: Record<string, string> = {
        chair: "chairs",
        chairs: "chairs",
        roundTable: "roundTable",
        squareTable: "squareTable",
    };
// @ts-ignore
    const kind = kindMap[el.kind] ?? el.kind ?? "chairs";

    // minimalne defaulty, żeby Canvas nigdy się nie wywalił
    const DEFAULT_WIDTH = 80;
    const DEFAULT_HEIGHT = 32;
    const DEFAULT_SEATS = 1;

    const cfg = el.config ?? {};

    return {
        id: el.id,
        kind: el.kind,
        name: el.name || "Unnamed",

        ballroom_id: el.ballroom_id,
        parent_id: el.parent_id ?? el.id,
        index: el.index ?? 0,

        x: num(el.x, 0),
        y: num(el.y, 0),

        color: el.color || "#475c6c",

        spacing: num(el.spacing, 30),

        focus: Boolean(el.focus),

        seats: num(cfg.seats, DEFAULT_SEATS),

        angle: num(cfg.angle, 0),

        angleOriginX: num(cfg.angle_origin_x, DEFAULT_WIDTH / 2),
        angleOriginY: num(cfg.angle_origin_y, DEFAULT_HEIGHT / 2),

        config: {
            width: num(cfg.width, DEFAULT_WIDTH),
            height: num(cfg.height, DEFAULT_HEIGHT),
            radius: num(cfg.radius, 0),
            size: num(cfg.size, 0),
            type: cfg.type ?? null,
            icon: el.icon ?? null,
        },
    };
}


export function mapToBackendEditFormat(el: AnyState) {

  return {
      // @ts-ignore
    id: el.id,
    name: el.name,
    kind: el.kind,
      // @ts-ignore
    ballroom_id: el?.ballroom_id,
      // @ts-ignore
    parent_id: el?.id,
    x: el.x,
    y: el.y,
    color: el.color,
      // @ts-ignore
    spacing: el.spacing ?? null,
      // @ts-ignore
    seats: el.config?.seats ?? null,
      // @ts-ignore
    status: el.status || 'active',
      // @ts-ignore
    icon: el.config?.icon ?? null,
    index: el.index,
    config: {
        // @ts-ignore
      width: el.config?.width ?? null,
        // @ts-ignore
      height: el.config?.height ?? null,
        // @ts-ignore
      radius: el.config?.radius ?? null,
        // @ts-ignore
      size: el.config?.size ?? null,
        // @ts-ignore
      seats: el.config?.seats ?? null,
        // @ts-ignore
      angle: el.angle ?? null,
        // @ts-ignore
      angle_origin_x: el.angleOriginX ?? null,
        // @ts-ignore
      angle_origin_y: el.angleOriginY ?? null,
    },
  };
}

export function mapToBackendCreateFormat(el: AnyState) {
    return {
    	name: el.name,
			type: el.kind,
			ballroom_id: 1,
			parent_id: null,
			x: el.x,
			y: el.y,
			color: el.color,
			kind: el.kind,
        // @ts-ignore
			icon: el.config?.icon ?? null,
			focus: el.focus,
        // @ts-ignore
			spacing: el?.spacing || 30,
			status: 'active',
			index: el.index,
			config: {
                // @ts-ignore
				seats: el.seats ?? null,
                // @ts-ignore
				radius: el.config?.radius ?? null,
                // @ts-ignore
				width: el.config?.width ?? null,
                // @ts-ignore
				height:el.config?.height ?? null,
                // @ts-ignore
				size: el.config?.size ?? null,
                // @ts-ignore
				angle: el.angle ?? null,
                // @ts-ignore
				angle_origin_x: el.angleOriginX ?? null,
                // @ts-ignore
				angle_origin_y: el.angleOriginY ?? null,
        
      },
    };
  }