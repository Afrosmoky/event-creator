import { useI18nContext } from "@/app/context/I18nContext";
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { applyDiff, useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { createPngBlobFromSvg, createSvgBlobFromSvg, openBlobInWindow, saveBlobToFile } from "@/app/utils/svg";
import { DownloadIcon, ExternalLinkIcon, FileImageIcon, SplineIcon, UsersRound, UsersRoundIcon } from "lucide-solid";
import { createSvgItemFromBlueprint, deepCloneObj, SvgItems, type SvgItemBlueprint } from "./SvgItem";
import { SvgIcon } from "./SvgItemIcon";
import API from "@/app/api/API";
import { Portal } from "solid-js/web";
import { createStore, produce } from "solid-js/store";

interface SideMenuItem {
    blueprint: SvgItemBlueprint,
    icon: string,
    overwrite?: any
}

interface SideMenuConfig {
    groups: {
        name: string,
        items: SideMenuItem[]
    }[]
}

const config: SideMenuConfig = {
    groups: [
        {
            name: "category_equipment",
            items: [
                {
                    blueprint: SvgItems.TABLE_RECT,
                    icon: "square-table"
                },
                {
                    blueprint: SvgItems.TABLE_T,
                    icon: "t-table"
                },
                {
                    blueprint: SvgItems.TABLE_U,
                    icon: "u-table"
                },
                {
                    blueprint: SvgItems.TABLE_CIRCLE,
                    icon: "round-table"
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "high-chair-sign",
                    overwrite: {
                        props: { icon: "high-chair-sign" }
                    }
                }
            ]
        },
        {
            name: "category_attractions",
            items: [
                {
                    blueprint: SvgItems.ICON,
                    icon: "cake",
                    overwrite: {
                        props: { icon: "cake" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "dj-controller",
                    overwrite: {
                        props: { icon: "dj-controller" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "firework",
                    overwrite: {
                        props: { icon: "firework" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "gifts",
                    overwrite: {
                        props: { icon: "gifts" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "microphone",
                    overwrite: {
                        props: { icon: "microphone" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "sound",
                    overwrite: {
                        props: { icon: "sound" }
                    }
                }
            ]
        },
        {
            name: "category_infrastructure",
            items: [
                {
                    blueprint: SvgItems.ICON,
                    icon: "air-conditioner",
                    overwrite: {
                        props: { icon: "air-conditioner" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "caution-sign",
                    overwrite: {
                        props: { icon: "caution-sign" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "compass",
                    overwrite: {
                        props: { icon: "compass" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "dance-area",
                    overwrite: {
                        props: { icon: "dance-area" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "disability-sing",
                    overwrite: {
                        props: { icon: "disability-sing" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "electrical-outlet",
                    overwrite: {
                        props: { icon: "electrical-outlet" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "fan",
                    overwrite: {
                        props: { icon: "fan" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "heater",
                    overwrite: {
                        props: { icon: "heater" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "light",
                    overwrite: {
                        props: { icon: "light" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "smoke",
                    overwrite: {
                        props: { icon: "smoke" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "toilet-sign",
                    overwrite: {
                        props: { icon: "toilet-sign" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "tree",
                    overwrite: {
                        props: { icon: "tree" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "water",
                    overwrite: {
                        props: { icon: "water" }
                    }
                }
            ]
        },
        {
            name: "category_layout",
            items: [
                {
                    blueprint: SvgItems.ICON,
                    icon: "arrow",
                    overwrite: {
                        props: { icon: "arrow" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "left door",
                    overwrite: {
                        props: { icon: "left door" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "pillar",
                    overwrite: {
                        props: { icon: "pillar" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "right-door",
                    overwrite: {
                        props: { icon: "right-door" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "stage",
                    overwrite: {
                        props: { icon: "stage" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "strainght-wall",
                    overwrite: {
                        props: { icon: "strainght-wall" }
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "target",
                    overwrite: {
                        props: { icon: "target" }
                    }
                }
            ]
        },
        {
            name: "category_text",
            items: [
                {
                    blueprint: SvgItems.TEXT,
                    icon: "label"
                }
            ]
        }
    ]
};

interface DraggingState {
    x: number,
    y: number,
    item: SideMenuItem | null
}

export function AppBottomMenu(props: {
    ballroom_id: string
}) {
    let exportControlDOM: HTMLDivElement = null!;

    const i18n = useI18nContext();
    const canvas = useSvgDrawerContext();
    
    const [showExportPicker, setShowExportPicker] = createSignal(false);

    onMount(() => {
		document.addEventListener("pointerdown", onWindowPointerDown);
	});

	onCleanup(() => {
		document.removeEventListener("pointerdown", onWindowPointerDown);
	})

	function onWindowPointerDown(e: PointerEvent) {
		const target = e.target as Node;
		if(target != exportControlDOM && !exportControlDOM.contains(target)) {
			setShowExportPicker(false);
		}
	}

    function cloneRootDOMNicely() {
        const rootDOM = canvas.rootDOM();
        if(!rootDOM) {
            return null;
        }

        const prevPanX = canvas.panX();
        const prevPanY = canvas.panY();
        const prevZoom = canvas.zoom();

        canvas.zoomToFit();

        const clone = rootDOM.cloneNode(true) as SVGSVGElement;
        const frame = clone.querySelector("#canvas_frame") as SVGRectElement;
        if(frame) {
            frame.setAttribute("fill", "none");
        }

        canvas.setPanX(prevPanX);
        canvas.setPanY(prevPanY);
        canvas.setZoom(prevZoom);

        return clone;
    }

	async function openBlob(type: "svg" | "png") {
		const rootDOM = canvas.rootDOM();
		if(!rootDOM) {
			return;
		}

        const clone = cloneRootDOMNicely();
        document.body.appendChild(clone);

        try {
            const url = type == "svg" ? 
                createSvgBlobFromSvg(clone) :
                await createPngBlobFromSvg(clone);

            openBlobInWindow(url);
        } catch (error) {
            console.error("Error exporting image:", error);
        } finally {
            document.body.removeChild(clone);
            setShowExportPicker(false);
        }
		
	}

	async function downloadBlob(type: "svg" | "png") {
		const rootDOM = canvas.rootDOM();
		if(!rootDOM) {
			return;
		}

        const clone = cloneRootDOMNicely();
        document.body.appendChild(clone);

        try {
            const url = type == "svg" ?
                createSvgBlobFromSvg(clone) :
                await createPngBlobFromSvg(clone);

            saveBlobToFile(url, type);
        } catch (error) {
            console.error("Error exporting image:", error);
        } finally {
            setShowExportPicker(false);
            document.body.removeChild(clone);
        }
	}

    async function downloadGuestsCsv() {
        const url = API.export_guests_csv_url(props.ballroom_id);
        window.open(url, "_blank");

        setShowExportPicker(false);
    }

    function createNewArea() {
        createNewItem(SvgItems.AREA, {
            w: 1000,
            h: 1000
        });
    }

    function createNewItem(blueprint: SvgItemBlueprint, overwrite?: any, position?: { x: number, y: number }) {
        let item = createSvgItemFromBlueprint(blueprint);
        if(overwrite) {
            applyDiff(item, overwrite);
        }

        item.x = position ? position.x : -canvas.panX() / canvas.zoom();
        item.y = position ? position.y : -canvas.panY() / canvas.zoom();

        item = canvas.addItem(undefined, item);
        canvas.setFocusedItem({ id: item.id });
    }

    const [draggingState, setDraggingState] = createStore<DraggingState>({ x: 0, y: 0, item: null });
    let dragStartPosition = { x: 0, y: 0 };

    function onIconPointerDown(event: PointerEvent, item: SideMenuItem) {
        const target = event.currentTarget as HTMLElement;
        target.setPointerCapture(event.pointerId);

        event.preventDefault();
        dragStartPosition = { x: event.clientX, y: event.clientY };
    }

    function onIconPointerMove(event: PointerEvent, item: SideMenuItem) {
        const target = event.currentTarget as HTMLElement;
        if (!target.hasPointerCapture(event.pointerId)) return;

        event.preventDefault();

        if(!draggingState.item) {
            const deltaX = event.clientX - dragStartPosition.x;
            const deltaY = event.clientY - dragStartPosition.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if(distance < 10) {
                return;
            }

            setDraggingState(produce(state => {
                state.x = event.clientX;
                state.y = event.clientY;
                state.item = item;
            }));
        } else {
            setDraggingState("x", event.clientX);
            setDraggingState("y", event.clientY);
        }
    }

    function onIconPointerUp(event: PointerEvent, item: SideMenuItem) {
        const target = event.currentTarget as HTMLElement;
        if(target.hasPointerCapture(event.pointerId)) {
            target.releasePointerCapture(event.pointerId);

            if(!draggingState.item) {
                createNewItem(item.blueprint, item.overwrite);
            } else {
                const zoom = canvas.zoom();
                const mouseWorldX = (event.clientX - canvas.clientWidth() / 2 - canvas.panX()) / zoom;
                const mouseWorldY = (event.clientY - canvas.clientHeight() / 2 - canvas.panY()) / zoom;

                createNewItem(item.blueprint, item.overwrite, { x: mouseWorldX, y: mouseWorldY });
            }
        }

        event.preventDefault();
        setDraggingState("item", null);
    }

    return (
        <div class="flex flex-col justify-end w-48 h-full gap-4 text-foreground bg-card">
            <div class="grow overflow-y-auto overscroll-none p-2 flex flex-col gap-4 no-scrollbar">
                <button 
                    class="p-3 rounded-md bg-background border border-border flex justify-center cursor-pointer"
                    on:click={() => createNewArea()}
                >
                    <p class="text-sm">Stwórz nową salę</p>
                </button>
                <For each={config.groups}>
                    {group => (
                        <>
                            <h3 class="uppercase text-sm font-semibold text-foreground border-b border-dashed border-border">
                                {i18n.t_dynamic(group.name)}
                            </h3>
                            <div class="grid grid-cols-2 gap-2">
                                <For each={group.items}>
                                    {item => (
                                        <button 
                                            class="p-4 rounded-md bg-background border border-border flex justify-center cursor-pointer touch-none"
                                            on:pointerdown={(event) => onIconPointerDown(event, item)}
                                            on:pointermove={(event) => onIconPointerMove(event, item)}
                                            on:pointercancel={(event) => onIconPointerUp(event, item)}
                                            on:pointerup={(event) => onIconPointerUp(event, item)}
                                        >
                                            <SvgIcon icon={item.icon} width={32} height={32} />
                                        </button>
                                    )}
                                </For>
                            </div>
                        </>
                    )}
                </For>
            </div>
            <Show when={draggingState.item}>
                <Portal>
                    <div 
                        class="absolute pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2"
                        style={{
                            "left": draggingState.x + "px",
                            "top": draggingState.y + "px"
                        }}
                    >
                        <SvgIcon icon={draggingState.item.icon} width={48} height={48} />
                    </div>
                </Portal>
            </Show>
            <div class="flex flex-col gap-2">
                <div class="relative" ref={exportControlDOM}>
                    <button 
                        class="
                            rounded-sm w-full px-4 py-2 text-sm border-border border bg-primary-soft text-foreground cursor-pointer
                            flex gap-2 items-center justify-center
                        "
                        onClick={() => setShowExportPicker(!showExportPicker())}
                    >
                        <DownloadIcon stroke-width={1.5} height={20} width="auto"/>
                        <label class="pointer-events-none">{i18n.t("export")}</label>
                    </button>
                    <div 
                        class="-top-2 left-0 -translate-y-full w-64 h-fit overflow-y-scroll no-scrollbar bg-card border-border border rounded-md shadow-md shadow-black/20"
                        classList={{
                            "absolute": showExportPicker(),
                            "hidden": !showExportPicker()
                        }}
                    >
                        <div class="flex flex-col p-2">
                            <div
                                class="border-border border-b-2 border-dashed pb-2 px-1 font-semibold"
                            >
                                <div class="flex items-center justify-between py-1">
                                    <div class="flex gap-1">
                                        <SplineIcon />
                                        <label class="pl-1">SVG</label>
                                    </div>
                                    
                                    <div class="flex gap-2">
                                        <button 
                                            class="rounded-md p-2 bg-primary-soft border-border border cursor-pointer"
                                            on:click={() => openBlob("svg")}>
                                            <ExternalLinkIcon width="16" height="16" />
                                        </button>
                                        <button 
                                            class="rounded-md p-2 bg-primary-soft border-border border cursor-pointer"
                                            on:click={() => downloadBlob("svg")}>
                                            <DownloadIcon width="16" height="16" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div
                                class="border-border border-b-2 border-dashed pb-2 pt-2 px-1 font-semibold"
                            >
                                <div class="flex items-center justify-between py-1">
                                    <div class="flex gap-1">
                                        <FileImageIcon />
                                        <label class="pl-1">PNG</label>
                                    </div>
                                    <div class="flex gap-2">
                                        <button 
                                            class="rounded-md p-2 bg-primary-soft border-border border cursor-pointer"
                                            on:click={() => openBlob("png")}>
                                            <ExternalLinkIcon width="16" height="16" />
                                        </button>
                                        <button 
                                            class="rounded-md p-2 bg-primary-soft border-border border cursor-pointer"
                                            on:click={() => downloadBlob("png")}>
                                            <DownloadIcon width="16" height="16" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div
                                class="pt-2 px-1 font-semibold"
                            >
                                <div class="flex items-center justify-between py-1">
                                    <div class="flex gap-1">
                                        <UsersRound />
                                        <label class="pl-1">Goście</label>
                                    </div>
                                    <div class="flex gap-2">
                                        <button 
                                            class="rounded-md p-2 bg-primary-soft border-border border cursor-pointer"
                                            on:click={() => downloadGuestsCsv()}>
                                            <DownloadIcon width="16" height="16" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}