export type EnumLike = Record<string, string | number>;
export type EnumValues<T extends EnumLike> = T[keyof T];

export function isEnumObject(value: unknown): value is Record<string, string | number> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).some(v => typeof v === "string" || typeof v === "number")
  );
}

export type PropertyDescriptor<TType = "string" | "number" | "color" | "icon" | EnumLike> = {
    type: TType,
    name: string,
    is_int?: boolean,
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
            descriptor.default = descriptor.default ?? "#aaaaaa";
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

let nonce = 0;
export function createSvgItemFromBlueprint<T extends PropertiesDescriptor>(
    blueprint: SvgItemBlueprint<T>,
    id?: number
) {
    let props: any = {};
    for(const key in blueprint.props) {
        props[key] = blueprint.props[key].default;
    }

    if(id === undefined) {
       id  = nonce++;
    }

    const item: SvgItem<PropsFromDescriptor<T>> = {
        id: id,
        kind: blueprint.type,
        x: 0, y: 0,
        w: 256, h: 256,
        angle: 0,
        props,
        last_update: Date.now()
    };

    return item;
}

export enum SvgItemType {
    TABLE_CIRCLE = "TABLE_CIRCLE",
    TABLE_RECT = "TABLE_RECT",
    TABLE_T = "TABLE_T",
    TABLE_U = "TABLE_U",
    ICON = "ICON"
}

export class SvgItem<Props = Record<string, any>> {
    constructor(
        public id: number,
        public kind: string = SvgItemType.TABLE_T,
        public x: number = 0,
        public y: number = 0,
        public w: number = 100,
        public h: number = 100,
        public angle: number = 0,
        public props: Props
    ) {}

    public last_update = Date.now();
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
        min: 40
    },
    "color": {
        type: "color",
        name: "prop_bg_color",
        default: "#aaaaaa"
    }
});

export type SvgItemTableProps = PropsFromDescriptor<typeof SvgItemTablePropsDef>;

export function isSvgItemTable(item: SvgItem<any>): item is SvgItem<SvgItemTableProps> {
    return item.kind.startsWith("TABLE_");
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
    ICON: {
        type: "ICON",
        props: SvgItemIconPropsDef
    }
} as const satisfies { [key: string]: SvgItemBlueprint };