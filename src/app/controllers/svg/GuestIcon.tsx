import { Guest } from "@/app/context/SvgDrawerContext";
import { createMemo, JSX, Match, splitProps, Switch } from "solid-js";
import { SvgIcon } from "./SvgItemIcon";

export function GuestIcon(
    props: { guest: Guest, radius: number }
) {
    const age_group = createMemo(() => props.guest.age_group || "adult");
    const gender = createMemo(() => props.guest.gender === "woman" ? "w" : "m");

    return (
        <Switch>
            <Match when={age_group() === "baby"}>
                <SvgIcon icon={`group_baby_${gender()}`} x={0} y={0} width={props.radius * 2} height={props.radius * 2} />
            </Match>
            <Match when={age_group() === "child"}>
                <SvgIcon icon={`group_child_${gender()}`} x={0} y={0} width={props.radius * 2} height={props.radius * 2} />
            </Match>
            <Match when={age_group() === "youth"}>
                <SvgIcon icon={`group_youth_${gender()}`} x={0} y={0} width={props.radius * 2} height={props.radius * 2} />
            </Match>
            <Match when={true}>
                <SvgIcon icon={`group_adult_${gender()}`} x={0} y={0} width={props.radius * 2} height={props.radius * 2} />
            </Match>
        </Switch>
    )
}

export function GuestDietIcon(
    props: { guest: Guest, radius: number } & JSX.SvgSVGAttributes<SVGSVGElement>
) {
    const [local, rest] = splitProps(props, ["guest", "radius"]);
    const menu = createMemo(() => local.guest.menu?.toLowerCase() || "standard");

    return (
        <Switch>
            <Match when={menu() === "vegetarian"}>
                <SvgIcon icon="vegetarian" width={local.radius * 2} height={local.radius * 2} {...rest} />
            </Match>
            <Match when={menu() === "vegan"}>
                <SvgIcon icon="vegan" width={local.radius * 2} height={local.radius * 2} {...rest} />
            </Match>
        </Switch>
    );
}