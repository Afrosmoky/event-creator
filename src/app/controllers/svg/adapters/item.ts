import API from "@/app/api/API";
import { applyDiff, DeepPartial } from "@/app/context/SvgDrawerContext";
import { createSvgItemFromBlueprint, SvgItem, SvgItemBlueprint, SvgItems } from "../SvgItem";
import { assign, bool, color, num, str } from "../utils";

const backendTypeToBlueprint = {
    ["TABLE_RECT"]: SvgItems.TABLE_RECT,
    ["square-table"]: SvgItems.TABLE_RECT,
    ["TABLE_CIRCLE"]: SvgItems.TABLE_CIRCLE,
    ["TABLE_T"]: SvgItems.TABLE_T,
    ["TABLE_U"]: SvgItems.TABLE_U,
    ["ICON"]: SvgItems.ICON
} as { [key: string]: SvgItemBlueprint }; 

export function decodeBackendElement(element: DeepPartial<API.Element>) {
    const item: DeepPartial<SvgItem> = {};
    const props: any = {};

    assign(item, "x", element.x, num);
    assign(item, "y", element.y, num);
    assign(item, "w", element.config?.width, num);
    assign(item, "h", element.config?.height, num);
    assign(item, "angle", element.config?.angle, num);
    
    assign(props, "name", element.name, str);
    assign(props, "seats", element.config?.seats, num);
    assign(props, "seat_spacing", element.spacing, num);
    assign(props, "color", element.color, color);
    assign(props, "top_height", element.config?.top_height, num);
    assign(props, "middle_width", element.config?.bottom_width, num);
    assign(props, "arms_width", element.config?.arms_width, num);
    assign(props, "bottom_height", element.config?.bottom_height, num);
    assign(props, "radius", element.config?.radius, num);
    assign(props, "label", element.name, str);
    assign(props, "icon", element.icon, str);
    assign(props, "show_unseated", element.config?.show_unseated, bool);

    if(Object.keys(props).length > 0) {
        item.props = props;
    }

    return item;
}

/**
 * Important: Empty ballroom_id key!
 */
export function encodeClientItem(item: DeepPartial<SvgItem>) {
    const element: DeepPartial<API.Element> = {};
    const config: DeepPartial<API.Element["config"]> = {};

    assign(element, "id", item.id, num);
    assign(element, "name", item.props?.name, str);
    assign(element, "icon", item.props?.icon, str);
    assign(element, "x", item.x, num);
    assign(element, "y", item.y, num);
    assign(element, "color", item.props?.color, color);
    assign(element, "kind", item.kind, str);
    assign(element, "spacing", item.props?.seat_spacing, num);
    assign(config, "seats", item.props?.seats, num);
    assign(config, "radius", item.props?.radius, num);
    assign(config, "width", item.w, num);
    assign(config, "height", item.h, num);
    assign(config, "angle", item.angle, num);
    assign(config, "top_height", item.props?.top_height, num);
    assign(config, "bottom_width", item.props?.middle_width, num);
    assign(config, "arms_width", item.props?.arms_width, num);
    assign(config, "bottom_height", item.props?.bottom_height, num);
    assign(config, "show_unseated", item.props?.show_unseated, bool);

    if(Object.keys(config).length > 0) {
        element.config = config;
    }

    return element;
}

export function createItemFromBackend(element: DeepPartial<API.Element>) {
    const backendType = element.kind.toUpperCase();
    const blueprint = backendTypeToBlueprint[backendType];
    if(!blueprint) {
        console.warn(`No blueprint for backend kind ${backendType}`);
        return null;
    }

    const lastUpdated = new Date(element.updated_at ?? 0).getTime() + (60 * 60 * 1000);
    const item = createSvgItemFromBlueprint(blueprint);

    const decoded = decodeBackendElement(element);
    applyDiff(item, decoded);

    item.last_update = lastUpdated;
    return item;
}