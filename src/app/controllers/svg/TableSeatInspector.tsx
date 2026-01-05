import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { SvgItem, SvgItemIconProps, SvgItemTableSeatProps } from "./SvgItem";
import { useI18nContext } from "@/app/context/I18nContext";
import { InspectorCategory, InspectorCategoryContent, InspectorCategoryTitle, InspectorContent, InspectorHead, InspectorTitle } from "./InspectorPresets";
import { createMemo, For, Match, Show, Switch } from "solid-js";
import { GuestAPIType } from "@/app/api/apiEndpoints";
import { CircleUserRoundIcon, UnlinkIcon } from "lucide-solid";

interface TableSeatInspectorProps {
    item: SvgItem<SvgItemTableSeatProps>;
}

export default function TableSeatInspector(
    props: TableSeatInspectorProps
) {
    const i18n = useI18nContext();
    const context = useSvgDrawerContext();

    const seatedGuest = createMemo(() => {
        for(const seated of context.seats) {
            if(seated.table_id === props.item.parent?.id && seated.seat_index === props.item.props.index) {
                return context.guests.find(o => o.guest_id === seated.guest_id);
            }
        }

        return null;
    })

    const guestsToSeat = createMemo(() => {
        return context.guests.filter(guest => {
            return !context.isGuestSeated(guest.guest_id);
        });
    })

    function onGuestClick(guest: GuestAPIType) {
        if(props.item.parent?.id === undefined) {
            console.warn(`Can't seat the guest at invalid table`);
            return;
        }

        context.seatGuest(guest.guest_id, props.item.parent.id, props.item.props.index);
    }

    function onReleaseSeat() {
        if(!seatedGuest()) {
            console.warn(`Can't release unseated seat!`);
            return;
        }

        context.unseatGuest(seatedGuest().guest_id);
    }

    return (
        <>
            <InspectorCategory>
                <InspectorCategoryContent>
                    <Switch>
                        <Match when={seatedGuest()}>
                            <CircleUserRoundIcon class="self-center" width={96} height={96} stroke="var(--color-foreground)" />
                            <label class="text-foreground font-semibold text-sm text-center">
                                {seatedGuest().name} {seatedGuest().surname}
                            </label>
                        </Match>
                        <Match when={!seatedGuest()}>
                            <div class="self-center rounded-full w-24 h-24 mb-8 bg-primary-soft border-2 border-border border-dashed flex items-center justify-center">
                                <label class="text-foreground-muted text-sm">Wolne</label>
                            </div>
                        </Match>
                    </Switch>
                </InspectorCategoryContent>
            </InspectorCategory>
            <InspectorCategory>
                <InspectorCategoryContent>
                    <Switch>
                        <Match when={guestsToSeat().length > 0}>
                            <div class="flex flex-col gap-1">
                                <label class="text-sm text-foreground-muted">Lista gości</label>
                                <div class="flex flex-col">
                                    <For each={guestsToSeat()}>
                                        {guest => (
                                            <button 
                                                class="text-xs p-4 bg-card border-b border-border text-start flex justify-between cursor-pointer"
                                                on:click={() => onGuestClick(guest)}
                                            >
                                                <p class="text-foreground font-semibold">{guest.name} {guest.surname}</p>
                                                <p class="text-foreground-muted">Przypisz</p>
                                            </button>
                                        )}
                                    </For>
                                </div>
                            </div>
                        </Match>
                        <Match when={true}>
                            <label class="text-center text-foreground-muted">Wszyscy goście usadzeni!</label>
                        </Match>
                    </Switch>
                    
                </InspectorCategoryContent>
            </InspectorCategory>
            <div class="grow"></div>
            <button 
                class="rounded-sm bg-primary-soft border-border border py-2 px-3 text-sm flex items-center justify-center gap-2"
                on:click={() => onReleaseSeat()}
            >
                <UnlinkIcon width={18} height="match" />
                <label>Zwolnij miejsce</label>
            </button>
        </>
    );
}