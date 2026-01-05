import { splitProps } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

export function Button(
    props: JSX.ButtonHTMLAttributes<HTMLButtonElement>
) {
    const [local, rest] = splitProps(props, ["class", "children"]);
    
    return (
        <button 
            class={`
                bg-primary-soft py-2 px-3 rounded-sm text-sm text-foreground border border-border 
                flex items-center justify-center gap-2 cursor-pointer ${local.class}
            `}

            {...rest}
        >
            {local.children}
        </button>
    );
}