import {SPRITES_META} from "@/sprite.gen.ts";
// @ts-ignore
const x = (e.clientX - zoomController.panX) / zoomController.zoom;
// @ts-ignore
const y = (e.clientY - zoomController.panY) / zoomController.zoom;
// @ts-ignore
const common = {
    name: 'test',
    x,
    y,
    color: '#bd50bd',
    focus: false,
    // @ts-ignore
    index: store.state.length,
};
// @ts-ignore
switch (item) {
    case 'round-table':
        // @ts-ignore
        return {
            ...common,
            kind: 'table',
            seats: 30,
            config: { type: 'circle', radius: 90 },
            spacing: 40,
        };
    case 'square-table':
        // @ts-ignore
        return {
            ...common,
            kind: 'square-table',
            seats: 30,
            config: { type: 'square', width: 256, height: 256 },
            spacing: 50,
        };
    case 't-table':
        // @ts-ignore
        return {
            ...common,
            kind: 't-table',
            seats: 30,
            config: { type: 't-table', width: 256, height: 256 },
            spacing: 40,
        };
    case 'u-table':
        // @ts-ignore
        return {
            ...common,
            kind: 'u-table',
            seats: 30,
            config: { type: 'u-table', width: 200, height: 200 },
            spacing: 40,
        };
    case 'long-table':
        // @ts-ignore
        return {
            ...common,
            kind: 'long-table',
            seats: 30,
            config: { type: 'long', width: 500, height: 256 },
            spacing: 40,
        };
    case 'row-of-chairs':
        // @ts-ignore
        return {
            ...common,
            kind: 'chairs',
            seats: 30,
            config: { width: 256 },
            angle: 0,
            angleOriginX: 0,
            angleOriginY: 0,
            spacing: 40,
        };
    default:
        // @ts-ignore
        const { width, height } = SPRITES_META.sprite.items[item];
        // @ts-ignore
        return {
            ...common,
            kind: 'icon',
            config: { size: 256, icon: item },
            angle: 0,
            angleOriginX: 0,
            angleOriginY: 0,
            x: x - width / 2,
            y: y - height * 2,
        };
}