import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";

export type EnumLike = Record<string, string | number>;
export type EnumValues<T extends EnumLike> = T[keyof T];

export function isEnumObject(value: unknown): value is Record<string, string | number> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).some(v => typeof v === "string" || typeof v === "number")
  );
}

export type PropertyDescriptor<TType = "string" | "number" | "bool" | "color" | "icon" | EnumLike | PropertiesDescriptor> = {
    type: TType,
    name: string,
    is_int?: boolean,
    is_array?: boolean,
    default?: ResolveDescriptorType<TType>,
    min?: number,
    hide_in_inspector?: boolean
}

export type PropertiesDescriptor = {
    [key: string]: PropertyDescriptor
};

type ResolveDescriptorType<T> =
    T extends "string" ? string :
    T extends "number" ? number :
    T extends "bool" ? boolean :
    T extends "color" ? string :
    T extends "icon" ? string :
    T extends EnumLike ? EnumValues<T> :
    never;

export type PropsFromDescriptor<
    T extends PropertiesDescriptor
> = {
    [P in keyof T]: ResolveDescriptorType<T[P]["type"]>;
};

function createTypeProps<T extends PropertiesDescriptor>(def: T) {
    for(const key in def) {
        const descriptor = def[key];
        if(descriptor.type === "number") {
            descriptor.default = descriptor.default ?? 0;
        } else if(descriptor.type === "string") {
            descriptor.default = descriptor.default ?? "";
        } else if(descriptor.type === "color") {
            descriptor.default = descriptor.default ?? "";
        } else {
            descriptor.default = descriptor.default ?? "";
        }
    }

    return def;
}

export interface SvgItemBlueprint<T extends PropertiesDescriptor = PropertiesDescriptor> {
    type: string,
    props: T
}

export function createSvgItem<T extends PropertiesDescriptor>(
    type: string,
    props_definition: T
) {
    let props: any = {};
    for(const key in props_definition) {
        props[key] = props_definition[key].default;
    }

    const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

    const item: SvgItem<PropsFromDescriptor<T>> = {
        id: id,
        kind: type,
        x: 0, y: 0,
        w: 256, h: 256,
        angle: 0,
        props,
        last_update: Date.now()
    };

    return item;
}

export function createSvgItemFromBlueprint<T extends PropertiesDescriptor>(
    blueprint: SvgItemBlueprint<T>
) {
    let props: any = {};
    for(const key in blueprint.props) {
        props[key] = blueprint.props[key].default;
    }

    const item: SvgItem<PropsFromDescriptor<T>> = {
        id: -1,
        kind: blueprint.type,
        x: 0, y: 0,
        w: 256, h: 256,
        angle: 0,
        props,
        last_update: Date.now()
    };

    return item;
}

export function cloneSvgItem(original: SvgItem) {
    let copy = deepCloneObj(original);

    copy.id = -1;
    copy.last_update = Date.now();

    return copy;
}

function deepCloneObj<T extends object>(obj: T): T {
    if(typeof obj !== 'object') {
        return obj;
    }

    let copy: any = {};

    for(const key in obj) {
        const value = obj[key];

        if(typeof value === 'object') {
            if(Array.isArray(value)) {
                copy[key] = [
                    ...value.map(o => deepCloneObj(o))
                ];
            } else {
                copy[key] = deepCloneObj(value);
            }
        } else {
            copy[key] = value;
        }
    }

    return copy;
}

export enum SvgItemType {
    TABLE_CIRCLE = "TABLE_CIRCLE",
    TABLE_RECT = "TABLE_RECT",
    TABLE_T = "TABLE_T",
    TABLE_U = "TABLE_U",
    TABLE_SEAT = "TABLE_SEAT",
    ICON = "ICON"
}

export interface SvgItem<Props = Record<string, any>> {
    id: number;
    kind: string;

    parent?: SvgItem;

    x: number;
    y: number;
    w: number;
    h: number;

    angle: number;
    props: Props;

    last_update: number;
}

export enum SvgItemTableType {
    RECT = 0,
    LETTER_T,
    LETTER_U
};

export const SvgItemTablePropsDef = createTypeProps({
    "name": {
        type: "string",
        name: "prop_name"
    },
    "seats": {
        type: "number",
        name: "prop_seats",
        is_int: true,
        default: 32,
        min: 0
    },
    "seat_radius": {
        type: "number",
        name: "prop_seat_radius",
        default: 20,
        min: 20,
        hide_in_inspector: true
    },
    "seat_spacing": {
        type: "number",
        name: "prop_seat_spacing",
        default: 45,
        min: 42
    },
    "preferred_seats": {
        type: "number",
        name: "pref",
        default: -1,
        min: -1
    },
    "show_unseated": {
        type: "bool",
        name: "prop_show_unseated",
        default: true
    },
    "color": {
        type: "color",
        name: "prop_bg_color",
        default: "#fdd994"
    }
});

export type SvgItemTableProps = PropsFromDescriptor<typeof SvgItemTablePropsDef>;

export function isSvgItemTable(item: SvgItem<any> | string): item is SvgItem<SvgItemTableProps> {
    if(typeof item === "string") {
        return item.startsWith("TABLE_");
    } else {
        return item.kind.startsWith("TABLE_");
    }
}

export const SvgItemTableSeatPropsDef = createTypeProps({
    "guest_id": {
        type: "string",
        name: "guest_id",
        default: null
    },
    "index": {
        type: "number",
        name: "index",
        default: 0
    },
    "radius": {
        type: "number",
        name: "radius",
        default: 21
    },
    "table_angle": {
        type: "number",
        name: "table_angle",
        default: 0
    }
});

export type SvgItemTableSeatProps = PropsFromDescriptor<typeof SvgItemTableSeatPropsDef>;

export function isSvgItemTableSeat(item: SvgItem<any>): item is SvgItem<SvgItemTableSeatProps> {
    return item.kind == SvgItemType.TABLE_SEAT;
}


export function isSvgItemTableRect(item: SvgItem<SvgItemTableProps>) {
    return item.kind === "TABLE_RECT";
}

export const SvgItemTableTPropsDef = createTypeProps({
    ...SvgItemTablePropsDef,
    "top_height": {
        type: "number",
        name: "prop_top_height",
        default: 32,
        min: 32
    },
    "middle_width": {
        type: "number",
        name: "prop_middle_width",
        default: 32,
        min: 32
    }
});

export type SvgItemTableTProps = PropsFromDescriptor<typeof SvgItemTableTPropsDef>;

export function isSvgItemTableT(item: SvgItem<SvgItemTableProps>): item is SvgItem<SvgItemTableTProps> {
    return item.kind === "TABLE_T";
}

export const SvgItemTableUPropsDef = createTypeProps({
    ...SvgItemTablePropsDef,
    "arms_width": {
        type: "number",
        name: "prop_arms_width",
        default: 32,
        min: 32
    },
    "bottom_height": {
        type: "number",
        name: "prop_bottom_height",
        default: 32,
        min: 32
    }
});

export const MIN_SEAT_SPACING = 42;
export const MAX_SEAT_SPACING = 180;
export const SEAT_RADIUS = 20;

export function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export type SvgItemTableUProps = PropsFromDescriptor<typeof SvgItemTableUPropsDef>;

export function isSvgItemTableU(item: SvgItem<SvgItemTableProps>): item is SvgItem<SvgItemTableUProps> {
    return item.kind === "TABLE_U";
}

export const SvgItemTableCirclePropsDef = createTypeProps({
    ...SvgItemTablePropsDef,
    "radius": {
        type: "number",
        name: "prop_radius",
        default: 64,
        min: 64
    }
});

export type SvgItemTableCircleProps = PropsFromDescriptor<typeof SvgItemTableCirclePropsDef>;

export function isSvgItemTableCircle(item: SvgItem<any>): item is SvgItem<SvgItemTableCircleProps> {
    return item.kind === "TABLE_CIRCLE";
}

export const SvgItemIconPropsDef = createTypeProps({
    "icon": {
        type: "icon",
        name: "icon",
        default: 'air-conditioner'
    },
    "label": {
        type: "string",
        name: "label"
    }
});

export type SvgItemIconProps = PropsFromDescriptor<typeof SvgItemIconPropsDef>;

export function isSvgItemIcon(item: SvgItem<any>): item is SvgItem<SvgItemIconProps> {
    return item.kind === "ICON";
}

export const SvgItems = {
    TABLE_RECT: {
        type: "TABLE_RECT",
        props: SvgItemTablePropsDef
    },
    TABLE_T: {
        type: "TABLE_T",
        props: SvgItemTableTPropsDef
    },
    TABLE_U: {
        type: "TABLE_U",
        props: SvgItemTableUPropsDef
    },
    TABLE_CIRCLE: {
        type: "TABLE_CIRCLE",
        props: SvgItemTablePropsDef
    },
    TABLE_SEAT: {
        type: SvgItemType.TABLE_SEAT,
        props: SvgItemTableSeatPropsDef,
    },
    ICON: {
        type: "ICON",
        props: SvgItemIconPropsDef
    }
} as const satisfies { [key: string]: SvgItemBlueprint };

export class ItemTableCircleModel {
    readonly context;

    constructor(
        private get: () => SvgItem<SvgItemTableCircleProps>
    ) {
        this.context = useSvgDrawerContext();
    }
}