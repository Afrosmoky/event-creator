import { Guest } from "@/app/context/SvgDrawerContext";
import { createMemo, JSX, Match, Show, splitProps, Switch } from "solid-js";
import { SvgIcon } from "./SvgItemIcon";

export function GuestIcon(
    props: { guest: Guest, radius: number }
) {
    const age_group = createMemo(() => props.guest.age_group || "adult");
    const gender = createMemo(() => props.guest.gender === "woman" ? "w" : "m");

    const icon = createMemo(() => {
        const age = age_group();
        const genderSuffix = gender();

        switch(age) {
            case "baby":
                return `group_baby_${genderSuffix}`;
            case "kid":
                return `group_child_${genderSuffix}`;
            case "youth":
                return `group_youth_${genderSuffix}`;
            default:
                return `group_adult_${genderSuffix}`;
        }
    });

    return (
        <SvgIcon icon={icon()} x={0} y={0} width={props.radius * 2} height={props.radius * 2} />
    );
}

export function GuestDietIcon(
    props: { guest: Guest, x?: number, y?: number, radius: number } & JSX.SvgSVGAttributes<SVGSVGElement>
) {
    const [local, rest] = splitProps(props, ["guest", "radius", "x", "y"]);
    const menu = createMemo(() => local.guest.menu?.toLowerCase() || "standard");

    const icon = createMemo(() => {
        switch(menu()) {
            case "vegetarian":
                return "vegetarian";
            case "vegan":
                return "vegan";
            default:
                return null;
        }
    });

    return (
        <Show when={icon() !== null}>
            <SvgIcon 
                icon={icon()} 

                x={(local.x ?? 0)} 
                y={(local.y ?? 0)} 
                width={local.radius * 2} 
                height={local.radius * 2} 

                {...rest} 
            />
        </Show>
    );
}