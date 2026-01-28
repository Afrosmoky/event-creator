import { useI18nContext } from "@/app/context/I18nContext";
import { createSignal, For, Match, onCleanup, onMount, Switch } from "solid-js";
import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { createPngBlobFromSvg, createSvgBlobFromSvg, openBlobInWindow, saveBlobToFile } from "@/app/utils/svg";
import { CircleUserIcon, DownloadIcon, ExternalLinkIcon, FileImageIcon, SplineIcon, UsersRound, UsersRoundIcon } from "lucide-solid";
import { createSvgItemFromBlueprint, SvgItems, type SvgItemBlueprint } from "./SvgItem";
import { SPRITES_META } from "@/sprite.gen";
import { SvgIcon } from "./SvgItemIcon";
import API from "@/app/api/API";

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
                        icon: "cake"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "dj-controller",
                    overwrite: {
                        icon: "dj-controller"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "firework",
                    overwrite: {
                        icon: "firework"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "gifts",
                    overwrite: {
                        icon: "gifts"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "microphone",
                    overwrite: {
                        icon: "microphone"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "sound",
                    overwrite: {
                        icon: "sound"
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
                        icon: "air-conditioner"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "caution-sign",
                    overwrite: {
                        icon: "caution-sign"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "compass",
                    overwrite: {
                        icon: "compass"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "dance-area",
                    overwrite: {
                        icon: "dance-area"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "disability-sing",
                    overwrite: {
                        icon: "disability-sing"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "electrical-outlet",
                    overwrite: {
                        icon: "electrical-outlet"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "fan",
                    overwrite: {
                        icon: "fan"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "heater",
                    overwrite: {
                        icon: "heater"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "light",
                    overwrite: {
                        icon: "light"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "smoke",
                    overwrite: {
                        icon: "smoke"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "toilet-sign",
                    overwrite: {
                        icon: "toilet-sign"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "tree",
                    overwrite: {
                        icon: "tree"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "water",
                    overwrite: {
                        icon: "water"
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
                        icon: "arrow"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "left door",
                    overwrite: {
                        icon: "left door"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "pillar",
                    overwrite: {
                        icon: "pillar"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "right-door",
                    overwrite: {
                        icon: "right-door"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "stage",
                    overwrite: {
                        icon: "stage"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "strainght-wall",
                    overwrite: {
                        icon: "strainght-wall"
                    }
                },
                {
                    blueprint: SvgItems.ICON,
                    icon: "target",
                    overwrite: {
                        icon: "target"
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
		setShowExportPicker(false);
	}

    async function downloadGuestsCsv() {
        const url = API.export_guests_csv_url(props.ballroom_id);
        window.open(url, "_blank");

        setShowExportPicker(false);
    }

    async function createSvgItemFromPicker(config: SideMenuItem) {
        let item = createSvgItemFromBlueprint(config.blueprint);
        for(const key in config.overwrite) {
            if(!config.blueprint.props[key]) {
                continue;
            }

            item.props[key] = config.overwrite[key];
        }

        item.x = -canvas.panX();
		item.y = -canvas.panY();

        item = canvas.addItem(undefined, item);
		canvas.setFocusedItemIndex(item.id);
    }

    return (
        <div class="flex flex-col justify-end w-48 h-full gap-4 text-foreground bg-card">
            <div class="grow overflow-y-auto overscroll-none p-2 flex flex-col gap-4 no-scrollbar">
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
                                            class="p-4 rounded-md bg-background border border-border flex justify-center cursor-pointer"
                                            on:click={() => createSvgItemFromPicker(item)}
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