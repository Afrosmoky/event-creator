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

type ResolveDescriptorType<T, IsArray = false> =
    IsArray extends true ? ResolveDescriptorType<T>[] :
    T extends "string" ? string :
    T extends "number" ? number :
    T extends "bool" ? boolean :
    T extends "color" ? string :
    T extends "icon" ? string :
    T extends PropertiesDescriptor ? PropsFromDescriptor<T> :
    T extends EnumLike ? EnumValues<T> :
    never;

export type PropsFromDescriptor<
    T extends PropertiesDescriptor
> = {
    [P in keyof T]: ResolveDescriptorType<T[P]["type"], T[P]["is_array"]>;
};

function createTypeProps<T extends PropertiesDescriptor>(def: T) {
    for(const key in def) {
        const descriptor = def[key];

        if(descriptor.is_array) {
            descriptor.default = descriptor.default ?? [] as any;
        } else if(descriptor.type === "number") {
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

export function createSvgItemFromBlueprint<T extends PropertiesDescriptor>(
    blueprint: SvgItemBlueprint<T>
) {
    let props: any = {};
    for(const key in blueprint.props) {
        props[key] = deepCloneObj(blueprint.props[key].default);
    }

    const item: SvgItem<PropsFromDescriptor<T>> = {
        id: null,
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

    copy.id = null;
    copy.last_update = Date.now();

    return copy;
}

export function deepCloneObj<T extends any>(obj: T): T {
    if(typeof obj !== 'object') {
        return obj;
    }

    if(Array.isArray(obj)) {
        return obj.map(o => deepCloneObj(o)) as any;
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
    ICON = "ICON",
    TEXT = "TEXT"
}

export interface SvgItem<Props = Record<string, any>> {
    id: number;
    kind: string;

    parent?: SvgItem;
    position_locked?: boolean;

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

export enum SvgItemTableSeatFacing {
    TABLE = 0,
    USER = 1
}

export const MIN_SEAT_SPACING = 42;
export const MAX_SEAT_SPACING = 180;
export const SEAT_RADIUS = 20;

export const TableSeatConfigDef = createTypeProps({
    x: {
        type: "number",
        name: "x",
        default: 0
    },
    y: {
        type: "number",
        name: "y",
        default: 0
    },
    radius: {
        type: "number",
        name: "radius",
        default: SEAT_RADIUS
    },
    angle: {
        type: "number",
        name: "angle",
        default: 0
    }
});

export type TableSeatConfigProps = PropsFromDescriptor<typeof TableSeatConfigDef>;

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
        default: "#9B1B48"
    },
    "border_color": {
        type: "color",
        name: "prop_border_color",
        default: "#2E2A26"
    },
    "border_width": {
        type: "number",
        name: "prop_border_width",
        default: 4,
        min: 0
    },
    "name_color": {
        type: "color",
        name: "prop_name_color",
        default: "#FFFFFF"
    },
    "name_font_size": {
        type: "number",
        name: "prop_name_font_size",
        default: 16,
        min: 8
    },
    "name_bold": {
        type: "bool",
        name: "prop_name_bold",
        default: false
    },
    "name_italic": {
        type: "bool",
        name: "prop_name_italic",
        default: false
    },
    "seat_facing": {
        type: SvgItemTableSeatFacing,
        name: "prop_seat_orientation",
        default: SvgItemTableSeatFacing.TABLE
    },
    "seat_configs": {
        type: TableSeatConfigDef,
        name: "prop_seat_configs",
        is_array: true,
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

export const SvgItemTextPropsDef = createTypeProps({
    "name": {
        type: "string",
        name: "prop_name",
        default: ""
    },
    "name_font_size": {
        type: "number",
        name: "prop_font_size",
        default: 16,
        min: 8
    },
    "name_bold": {
        type: "bool",
        name: "prop_bold",
        default: false
    },
    "name_italic": {
        type: "bool",
        name: "prop_italic",
        default: false
    },
    "name_color": {
        type: "color",
        name: "prop_color",
        default: "#000000"
    }
})

export type SvgItemTextProps = PropsFromDescriptor<typeof SvgItemTextPropsDef>;

export function isSvgItemText(item: SvgItem<any>): item is SvgItem<SvgItemTextProps> {
    return item.kind === "TEXT";
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
    ICON: {
        type: "ICON",
        props: SvgItemIconPropsDef
    },
    TEXT: {
        type: "TEXT",
        props: SvgItemTextPropsDef
    }
} as const satisfies { [key: string]: SvgItemBlueprint };