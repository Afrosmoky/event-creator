import { useI18nContext } from "@/app/context/I18nContext";
import { createSignal, For, Match, onCleanup, onMount, Switch } from "solid-js";
import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { createPngBlobFromSvg, createSvgBlobFromSvg, openBlobInWindow, saveBlobToFile } from "@/app/utils/svg";
import { CircleUserIcon, DownloadIcon, ExternalLinkIcon, FileImageIcon, SplineIcon, UsersRoundIcon } from "lucide-solid";
import { createSvgItemFromBlueprint, SvgItems, type SvgItemBlueprint } from "./SvgItem";
import { SPRITES_META } from "@/sprite.gen";
import { SvgIcon } from "./SvgItemIcon";

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
            name: "category_tables",
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
                }
            ]
        },
        {
            name: "category_icons",
            items: []
        }
    ]
};

for(const icon in SPRITES_META) {
    if(icon === "square-table" || icon === "t-table" || icon === "u-table" || icon === "round-table") {
        continue;
    }

    config.groups[1].items.push({
        blueprint: SvgItems.ICON,
        icon: icon,
        overwrite: {
            icon: icon
        }
    });
}

export function AppBottomMenu() {
    let exportControlDOM: HTMLDivElement = null!;

    const i18n = useI18nContext();
    const canvas = useSvgDrawerContext();
    
    const [showExportPicker, setShowExportPicker] = createSignal(false);
    const [group, setGroup] = createSignal<"icons" | "guests">("icons");

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

	async function openBlob(type: "svg" | "png") {
		const rootDOM = canvas.rootDOM();
		if(!rootDOM) {
			return;
		}

		const url = type == "svg" ? 
            createSvgBlobFromSvg(rootDOM) :
            await createPngBlobFromSvg(rootDOM);
		openBlobInWindow(url);

		setShowExportPicker(false);
	}

	async function downloadBlob(type: "svg" | "png") {
		const rootDOM = canvas.rootDOM();
		if(!rootDOM) {
			return;
		}

		const url = type == "svg" ?
            createSvgBlobFromSvg(rootDOM) :
            await createPngBlobFromSvg(rootDOM);

		saveBlobToFile(url, type);
		//URL.revokeObjectURL(url);

		setShowExportPicker(false);
	}

    async function createSvgItemFromPicker(item: SideMenuItem) {
        const svgItem = createSvgItemFromBlueprint(item.blueprint);
        for(const key in item.overwrite) {
            if(!item.blueprint.props[key]) {
                continue;
            }

            svgItem.props[key] = item.overwrite[key];
        }

        svgItem.x = -canvas.panX();
		svgItem.y = -canvas.panY();

        canvas.addItem(svgItem.id, svgItem);
		canvas.setFocusedItemIndex(svgItem.id);
    }

    return (
        <div class="flex flex-col justify-end w-48 h-full gap-4 text-foreground bg-card">
            <div class="grow overflow-y-auto p-2 flex flex-col gap-4 no-scrollbar">
                <Switch>
                    <Match when={group() === "icons"}>
                        <For each={config.groups}>
                            {group => (
                                <>
                                    <h3 class="uppercase text-sm font-semibold border-b border-dashed border-border">
                                        {i18n.t_dynamic(group.name)}
                                    </h3>
                                    <div class="grid grid-cols-2 gap-2">
                                        <For each={group.items}>
                                            {item => (
                                                <button 
                                                    class="p-4 rounded-md bg-background border border-border flex justify-center cursor-pointer"
                                                    on:click={() => createSvgItemFromPicker(item)}
                                                >
                                                    <SvgIcon icon={item.icon} width="32" height="32" inline={true} />
                                                </button>
                                            )}
                                        </For>
                                    </div>
                                </>
                            )}
                        </For>
                    </Match>
                    <Match when={group() === "guests"}>
                        <For each={canvas.guests}>
                            {guest => (
                                <div class="text-sm rounded-sm p-4 border-gray-200 border shadow-inner shadow-black/10">
                                    <div class="flex flex-col gap-3">
                                        <div class="flex gap-2">
                                            <CircleUserIcon width={36} height="auto" class="min-w-fit min-h-fit"/>
                                            <div class="grow flex flex-col items-center justify-center">
                                                <p class="font-semibold">{guest.name}</p>
                                                <p class="text-xs">{guest.surname}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </For>
                    </Match>
                </Switch>
            </div>
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
                                class="pt-2 px-1 font-semibold"
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}