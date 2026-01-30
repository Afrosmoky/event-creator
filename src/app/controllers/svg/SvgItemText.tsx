import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import type { SvgItem, SvgItemIconProps, SvgItemTextProps } from "./SvgItem";

import { createEffect, createMemo, untrack } from "solid-js";

interface SvgItemTextComponentProps {
    item: SvgItem<SvgItemTextProps>
}

export function SvgItemText(
    props: SvgItemTextComponentProps
) {
    let textDOM: SVGTextElement;

    const context = useSvgDrawerContext();
    const text = createMemo(() => props.item.props.name.trim());
    
    const lineHeight = createMemo(() => props.item.props.name_font_size * 1.2);
    const lines = createMemo(() => {
        if(text().length === 0) {
            return ["Wpisz dowolny tekst"];
        } else {
            return text().split("\n");
        }
    });

    const padding_x = 6;
    const padding_y = 4;
    const anchor: "start" | "middle" | "end" = "middle";

    createEffect(() => {
        console.log(`Current icon: ${props.item.props.name}`);
    });

    createEffect(() => {
        props.item.props.name_font_size;
        props.item.props.name;
        props.item.props.name_bold;
        props.item.props.name_italic;

        untrack(() => {
            const bbox = textDOM.getBBox();

            context.modifyItem(props.item.id, {
                w: Math.ceil(bbox.width) + padding_x * 2,
                h: Math.ceil(bbox.height) + padding_y * 2
            });
        });
    });

    function getXOffsetForAnchor(): number {
        switch(anchor) {
            case "start":
                return padding_x;
            case "middle":
                return props.item.w / 2;
            case "end":
                return props.item.w - padding_x;
        }
    }

    return (
        <g id={`item_${props.item.id}`}>
            <rect x={0} y={0} width={props.item.w} height={props.item.h} fill="#FAF1EF" rx={8} />
            <text
                ref={textDOM}
                font-size={`${props.item.props.name_font_size}px`}
                text-anchor={anchor}
            >
                {lines().map((line, index) => (
                    <tspan 
                        fill={props.item.props.name_color}
                        font-weight={props.item.props.name_bold ? "bold" : "normal"}
                        font-style={props.item.props.name_italic ? "italic" : "normal"}
                        x={getXOffsetForAnchor()}
                        y={props.item.props.name_font_size + padding_y}
                        dy={index * lineHeight()}
                    >
                        {line}
                    </tspan>
                ))}
            </text>
        </g>
    );
}