import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import type { SvgItem, SvgItemIconProps } from "./SvgItem";

import { createEffect, createMemo, createSignal, Match, splitProps, Switch, untrack, type ValidComponent } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { Dynamic } from "solid-js/web";

const icons = import.meta.glob("/src/assets/*.svg", { query: '?component-solid' });

interface SvgItemIconComponentProps {
    item: SvgItem<SvgItemIconProps>
}

interface SvgIconComponentProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
    icon: string
}

export function SvgIcon(
    props: SvgIconComponentProps
) {
    const [local, rest] = splitProps(props, ["icon", "width", "height"]);
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
        <Dynamic component={component()} pointer-event="none" width={local.width} height={local.height} {...rest} />    
    );
}

export function SvgItemIcon(
    props: SvgItemIconComponentProps
) {
    let iconDOM: SVGSVGElement;
    const context = useSvgDrawerContext();

    const [bbox, setBbox] = createSignal<DOMRect>();

    createEffect(() => {
        props.item.w;

        untrack(() => {
            if(props.item.h !== props.item.w) {
                /*context.modifyItem(props.item.id, {
                    h: props.item.w
                });*/
            }
        });
    });

    createEffect(() => {
        if(!iconDOM) {
            return;
        }

        const bbox = iconDOM.getBBox();
        setBbox(bbox);

        console.log(bbox);
    })

    return (
        <g>
            <rect x={bbox()?.x} y={bbox()?.y} width={bbox()?.width} height={bbox()?.height} fill="yellow" pointer-events="all" />
            <SvgIcon ref={iconDOM} icon={props.item.props.icon} width={props.item.w} height={props.item.h} />
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