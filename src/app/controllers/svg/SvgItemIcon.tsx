import type { SvgItem, SvgItemIconProps } from "./SvgItem";

import { createEffect, createMemo, createSignal, Match, Switch, type ValidComponent } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { Dynamic } from "solid-js/web";

const icons = import.meta.glob("/src/assets/*.svg", { query: '?component-solid' });

interface SvgItemIconComponentProps {
    item: SvgItem<SvgItemIconProps>
}

interface SvgIconComponentProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
    icon: string,
    inline?: boolean
}

export function SvgIcon(
    props: SvgIconComponentProps
) {
    const [component, setComponent] = createSignal<ValidComponent>();
    const fullpath = createMemo(() => "/src/assets/" + props.icon + ".svg");

    createEffect(() => {
        updateIconComponent();
    });

    async function updateIconComponent() {
        const importFn = icons[fullpath()];
        if(!importFn) {
            return;
        }

        const data: any = await importFn();
        setComponent(() => data.default);
    }

    return (
        <Dynamic component={component()} pointer-event="none" width={props.width} height={props.height}/>    
    );
}

export function SvgItemIcon(
    props: SvgItemIconComponentProps
) {
    return (
        <g>
            <rect width={props.item.w} height={props.item.h} fill="none" pointer-events="all"></rect>
            <SvgIcon icon={props.item.props.icon} width={props.item.w} height={props.item.h} />
            <text 
                x={props.item.w / 2}
                y={props.item.h + 20}
                text-anchor="middle"
            >
                {props.item.props.label}
            </text>
        </g>
    )
}