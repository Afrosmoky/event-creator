interface SvgItemTableSeatComponentProps {
    x: number;
    y: number;
    radius: number;
    angle: number;
    text?: string;
}

export function SvgItemTableSeat(
    props: SvgItemTableSeatComponentProps
) {
    return (
        <g 
            transform={`
                translate(${props.x} ${props.y})
                rotate(${-props.angle})
                translate(${-props.x} ${-(props.y)})
            `}
        >
            <circle
                cx={props.x}
                cy={props.y}
                r={props.radius}
                fill="white"
                stroke="black"
                stroke-dasharray="4 2"
            ></circle>
            <text
                x={props.x}
                y={props.y + 4}
                font-size="12"
                text-anchor="middle"
                fill="black"
            >
                {props.text ?? ""}
            </text>
        </g>
    )
}