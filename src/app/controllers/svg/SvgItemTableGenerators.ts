import type { SvgItem, SvgItemTableProps, SvgItemTableTProps, SvgItemTableUProps } from "./SvgItem";

export interface Point {
    x: number;
    y: number;
}

export interface SideParam {
    seat_start_padding?: number,
    seat_end_padding?: number
}

export interface SideParams {
    [key: number]: SideParam
}

export type SvgItemGeneratorFunction = (item: SvgItem<any>) => GeneratorReturn;
export type GeneratorReturn = [Point[], SideParams];

export function SvgItemTableRectGenerator(item: SvgItem<SvgItemTableProps>): GeneratorReturn {
    const points: Point[] = [];
    const { w: width, h: height } = item;

    points.push({ x: 0, y: 0 });
    points.push({ x: width, y: 0 });
    points.push({ x: width, y: height });
    points.push({ x: 0, y: height });

    return [points, {} as SideParams]
}

export function SvgItemTableTGenerator(item: SvgItem<SvgItemTableTProps>): GeneratorReturn {
    const points: { x: number; y: number }[] = [];
    const { w: width, h: height, props } = item;

    const top_height = props.top_height;
    const side_width = props.middle_width;

    points.push({ x: 0, y: 0 });
    points.push({ x: width, y: 0 });
    points.push({ x: width, y: top_height });
    points.push({ x: width / 2 + side_width / 2, y: top_height });
    points.push({ x: width / 2 + side_width / 2, y: height });
    points.push({ x: width / 2 - side_width / 2, y: height });
    points.push({ x: width / 2 - side_width / 2, y: top_height });
    points.push({ x: 0, y: top_height });

    const params: SideParams = {
        2: {
            seat_end_padding: props.seat_radius * 2 + 6
        },
        3: {
            seat_start_padding: 4
        },
        5: {
            seat_end_padding: 4
        },
        6: {
            seat_start_padding: props.seat_radius * 2 + 6
        }
    };

    return [points, params];
}

export function SvgItemTableUGenerator(item: SvgItem<SvgItemTableUProps>): GeneratorReturn {
    const points: { x: number; y: number }[] = [];
    const { w: width, h: height, props } = item;

    const arm_width = item.props.arms_width;
    const bottom_height = item.props.bottom_height;

    points.push({ x: 0, y: 0 });
    points.push({ x: arm_width, y: 0 });
    points.push({ x: arm_width, y: height - bottom_height });
    points.push({ x: width - arm_width, y: height - bottom_height });
    points.push({ x: width - arm_width, y: 0 });
    points.push({ x: width, y: 0 });
    points.push({ x: width, y: height });
    points.push({ x: 0, y: height });

    const params: SideParams = {
        1: {
            seat_end_padding: props.seat_radius * 2 + 6
        },
        2: {
            seat_start_padding: 4,
            seat_end_padding: 4
        },
        3: {
            seat_start_padding: props.seat_radius * 2 + 6
        }
    };

    return [points, params];
}