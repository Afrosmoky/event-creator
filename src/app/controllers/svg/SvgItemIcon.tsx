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

export function getIconFullpath(iconName: string): string {
    return "/src/assets/" + iconName + ".svg";
}

export function isIconAvailable(iconName: string): boolean {
    console.log(`Checking icon availability: ${iconName} -> ${getIconFullpath(iconName)}`);
    return icons[getIconFullpath(iconName)] !== undefined;
}

export function SvgIcon(
    props: SvgIconComponentProps
) {
    const [local, rest] = splitProps(props, ["icon", "width", "height"]);
    const [component, setComponent] = createSignal<ValidComponent>();

    createEffect(() => {
        updateIconComponent();
    });

    async function updateIconComponent() {
        const importFn = icons[getIconFullpath(props.icon)];
        if(!importFn) {
            // add fallback icon component
            setComponent(() => () => (
                <svg 
                    width={local.width} 
                    height={local.height} 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#FF9999"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <line x1="4" y1="4" x2="20" y2="20" stroke-width="2"/>
                    <line x1="20" y1="4" x2="4" y2="20" stroke-width="2"/>
                </svg>
            ));

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

    createEffect(() => {
        console.log(`Current icon: ${props.item.props.icon}`);
    })

    createEffect(() => {
        props.item.w;

        untrack(() => {
            if(props.item.h !== props.item.w) {
                context.modifyItem(props.item.id, {
                    h: props.item.w
                });
            }
        });
    });

    return (
        <g>
            <SvgIcon ref={iconDOM} icon={props.item.props.icon} width={props.item.w} height={props.item.h} fill="transparent" pointer-events="all" />
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