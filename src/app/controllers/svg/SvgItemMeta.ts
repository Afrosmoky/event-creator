import { SvgItems, type SvgItemBlueprint } from "./SvgItem";

export interface ItemSpawnMeta {
    blueprint: SvgItemBlueprint;
    name: string;
    icon: string;
    overwrite?: any;
}

export const ITEM_SPAWN_METAS = [
    {
        blueprint: SvgItems.TABLE_RECT,
        name: "rect_table",
        icon: "square-table"
    },
    {
        blueprint: SvgItems.TABLE_T,
        name: "t_table",
        icon: "t-table"
    },
    {
        blueprint: SvgItems.TABLE_U,
        name: "u_table",
        icon: "u-table"
    },
    {
        blueprint: SvgItems.TABLE_CIRCLE,
        name: "round_table",
        icon: "round-table"
    },
    {
        blueprint: SvgItems.ICON,
        name: "icon",
        icon: "air-conditioner"
    }
] as const satisfies ItemSpawnMeta[];