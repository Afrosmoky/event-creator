import { createMemo, createSignal, For, Match, Switch } from "solid-js";
import { Guest, useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { Inspector, InspectorContent, InspectorHead } from "./InspectorPresets";
import { MoveIcon, NotepadTextIcon, PinIcon, UnlinkIcon, UserRoundIcon, UsersRoundIcon } from "lucide-solid";
import { Button } from "./UI";
import { GuestDietIcon, GuestIcon } from "./GuestIcon";

export default function GuestListPanel(
    props: { show: boolean }
) {
    const context = useSvgDrawerContext();
    const [view, setView] = createSignal<"list" | "group">("list");

    const groupMap = createMemo(() => {
        const map: Record<string, Guest[]> = {};

        for(const guest of context.guests) {
            const section = map[guest.group] || [];
            section.push(guest);

            map[guest.group] = section;
        }

        return map;
    });

    function onReleaseAllSeats() {
        context.unseatAllGuests();
    }

    return (
        <Inspector show={props.show && context.focusedItemIndex() < 0}>
            <InspectorHead>
                <label class="self-start pt-2 pb-1 px-1 font-bold text-2xl">Lista gości</label>
                <label class="self-start px-1 pb-2 text-sm text-foreground-muted">
                    {context.guests.length} gości • {context.seats.length} przypisanych
                </label> 
            </InspectorHead>
            <InspectorContent>
                <Switch>
                    <Match when={view() === "list"}>
                        <For each={context.guests}>
                            {guest => (
                                <GuestElement guest={guest} />
                            )}
                        </For>
                    </Match>
                    <Match when={view() === "group"}>
                        <For each={Object.keys(groupMap()).sort()}>
                            {(group) => (
                                <GroupElement group={group} guests={groupMap()[group]} />
                            )}
                        </For>
                    </Match>
                </Switch>
            </InspectorContent>
            <div class="grow flex flex-col p-4 gap-2 justify-end">
                <Button 
                    on:click={() => setView(view() === "list" ? "group" : "list")}
                >
                    <UsersRoundIcon stroke-width={1.5} height={18} width={18} />
                    <p>Pokaż {view() === "list" ? "grupy" : "gości"}</p>
                </Button>
                <Button 
                    class="text-error!"
                    on:click={() => onReleaseAllSeats()}
                >
                    <UnlinkIcon stroke-width={1.5} height={18} width={18} />
                    <p>Zwolnij wszystkie miejsca</p>
                </Button>
            </div>
        </Inspector>
    )
}

export function GroupElement(
    props: { group: string, guests: Guest[] }
) {
    const context = useSvgDrawerContext();

    function onPointerDown(event: PointerEvent) {
        if(event.button != 0) {
            return;
        }

        context.setDraggingGroup(props.group);
    }

    return (
        <div
            class="select-none relative w-full text-sm rounded-sm p-4 pb-3 bg-primary-soft border-border border flex flex-col items-start gap-2"
        >
            <label class="text-foreground font-semibold">{props.group}</label>
            <ul class="flex flex-col gap-1 mt-1">
                <For each={props.guests}>
                    {guest => (
                        <li class="text-xs flex gap-1 text-foreground-muted">
                            <UserRoundIcon width={14} height={14} />
                            <label>{guest.name} {guest.surname}</label>
                        </li>
                    )}
                </For>
            </ul>
            <Button 
                class="w-full text-xs text-foreground-muted mt-1"
                on:pointerdown={onPointerDown}
            >
                <MoveIcon width={16} height={16}/>
                <p>Przeciągnij by przypisać</p>
            </Button>
        </div>
    )
}

export function GuestElement(
    props: { guest: Guest }
) {
    const context = useSvgDrawerContext();
    const seated = createMemo(() => context.seats.find(o => o.guest_id === props.guest.id));
    const seatedTable = createMemo(() => {
        if(!seated()) {
            return null;
        }

        return context.items[seated()!.table_id];
    })

    function onPointerDown(event: PointerEvent) {
        if(event.button != 0) {
            return;
        }

        context.setDraggingGuest(props.guest.id);
    }

    return (
        <div
            class="select-none relative w-full text-sm rounded-sm p-4 pb-3 bg-primary-soft border-border border flex flex-col items-start gap-2"
        >
            <div class="flex gap-2 items-center">
                <GuestIcon guest={props.guest} radius={12} />
                <label class="text-foreground font-semibold">{props.guest.name} {props.guest.surname}</label>
            </div>
            <div class="flex gap-1 mt-1">
                <PinIcon width={16} height="auto" fill="var(--color-error)" color="var(--color-error)" />
                <label class="text-foreground-muted text-xs italic">
                    {seated() ? 
                        `Stół ${seatedTable()?.props?.name || seated().id} Krzesło ${seated().seat_index + 1}`
                        : "Nie przypisany"
                    }
                </label>
            </div>
            <div class="flex w-full gap-1 items-start">
                <NotepadTextIcon width={16} height="auto" color="var(--color-foreground-muted)" />
                <textarea 
                    class="text-foreground-muted text-xs italic text-left grow resize-none no-scrollbar"
                    value={props.guest.note || ""} 
                    placeholder="Brak uwag"
                    spellcheck="false"
                    wrap="off"
                    rows={1}

                    on:pointerdown={(e) => e.stopPropagation()}
                    on:keydown={(e) => {
                        if(e.key === "Enter") {
                            e.preventDefault();
                            (e.target as HTMLTextAreaElement).blur();
                        }
                    }}
                    on:change={(e) => context.modifyGuestNote(props.guest.id, e.target.value)}
                ></textarea>
            </div>
            <Button 
                class="w-full text-xs text-foreground-muted mt-1"
                on:pointerdown={onPointerDown}
            >
                <MoveIcon width={16} height={16}/>
                <p>Przeciągnij by przypisać</p>
            </Button>
            <div class="absolute top-2 right-2">
                <GuestDietIcon guest={props.guest} radius={16} />
            </div>
           
        </div>
    )
}