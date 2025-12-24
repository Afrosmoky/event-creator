import { useI18nContext } from "@/app/context/I18nContext";
import { createSignal, For, Match, onCleanup, onMount, Switch } from "solid-js";
import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { createPngBlobFromSvg, createSvgBlobFromSvg, openBlobInWindow, saveBlobToFile } from "@/app/utils/svg";
import { DownloadIcon, ExternalLinkIcon } from "lucide-solid";
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
        <div class="flex flex-col justify-end w-40 h-full gap-4">
            <div class="grow overflow-y-auto p-2 flex flex-col gap-4 no-scrollbar">
                <Switch>
                    <Match when={group() === "icons"}>
                        <For each={config.groups}>
                            {group => (
                                <>
                                    <h3 class="uppercase text-sm font-semibold border-b border-dashed border-gray-300">
                                        {i18n.t_dynamic(group.name)}
                                    </h3>
                                    <div class="grid grid-cols-2 gap-2">
                                        <For each={group.items}>
                                            {item => (
                                                <button 
                                                    class="p-4 rounded-md shadow-inner shadow-black/40 flex justify-center cursor-pointer"
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
                        <button >
                            New guest
                        </button>
                    </Match>
                </Switch>
            </div>
            <div class="flex flex-col gap-2">
                <div class="relative" ref={exportControlDOM}>
                    <button 
                        class="rounded-md w-full px-4 py-2 text-sm font-semibold border-gray-800 border bg-black text-white shadow-md shadow-black/60 cursor-pointer"
                        onClick={() => setShowExportPicker(!showExportPicker())}
                    >
                        {i18n.t("export")}
                    </button>
                    <div 
                        class="-top-2 left-0 -translate-y-full w-64 h-fit overflow-y-scroll no-scrollbar bg-white border-gray-200 border rounded-md shadow-md shadow-black/20"
                        classList={{
                            "absolute": showExportPicker(),
                            "hidden": !showExportPicker()
                        }}
                    >
                        <div class="flex flex-col p-2">
                            <div
                                class="bg-white border-gray-200 border-b-2 border-dashed pb-2 px-1 font-semibold"
                            >
                                <div class="flex items-center justify-between py-1">
                                    <p class="pl-1">SVG</p>
                                    <div class="flex gap-2">
                                        <button 
                                            class="rounded-md p-2 border-gray-200 border cursor-pointer"
                                            on:click={() => openBlob("svg")}>
                                            <ExternalLinkIcon width="16" height="16" />
                                        </button>
                                        <button 
                                            class="rounded-md p-2 border-gray-200 border cursor-pointer"
                                            on:click={() => downloadBlob("svg")}>
                                            <DownloadIcon width="16" height="16" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div
                                class="bg-white pt-2 px-1 font-semibold"
                            >
                                <div class="flex items-center justify-between py-1">
                                    <p class="pl-1">PNG</p>
                                    <div class="flex gap-2">
                                        <button 
                                            class="rounded-md p-2 border-gray-200 border cursor-pointer"
                                            on:click={() => openBlob("png")}>
                                            <ExternalLinkIcon width="16" height="16" />
                                        </button>
                                        <button 
                                            class="rounded-md p-2 border-gray-200 border cursor-pointer"
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