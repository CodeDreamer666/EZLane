"use client";
import {
    useEffect,
    useRef,
    useState,
    type Dispatch,
    type SetStateAction,
} from "react";
import SheetButton from "~/components/proposals/SheetButton";
import ToolButton from "~/components/proposals/ToolButton";
import {
    IconAlignCenter,
    IconAlignJustify,
    IconAlignLeft,
    IconAlignRight,
    IconBold,
    IconBulletList,
    IconClearFormat,
    IconClose,
    IconItalic,
    IconLink,
    IconMore,
    IconNumberList,
    IconUnderline,
} from "~/components/proposals/ToolbarIcons";
import { Select } from "~/components/shared";
import cn from "~/lib/cn";
import {
    PROPOSAL_FONTS,
    PROPOSAL_FONT_SIZES,
    type ProposalEditorForm,
} from "~/schema/proposal";

const BTN =
    "text-text/72 hover:bg-text/8 hover:text-text active:bg-text/14 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[5px] border border-transparent bg-transparent disabled:cursor-not-allowed disabled:opacity-35 max-lg:h-10 max-lg:w-10";

const SELECT = "min-h-8! text-[12.5px]! max-lg:min-h-10!";

const ALIGN = [
    { label: "Align left", cmd: "justifyLeft", Icon: IconAlignLeft },
    { label: "Align center", cmd: "justifyCenter", Icon: IconAlignCenter },
    { label: "Align right", cmd: "justifyRight", Icon: IconAlignRight },
    { label: "Justify", cmd: "justifyFull", Icon: IconAlignJustify },
] as const;

const LISTS = [
    { label: "Bulleted list", cmd: "insertUnorderedList", Icon: IconBulletList },
    { label: "Numbered list", cmd: "insertOrderedList", Icon: IconNumberList },
] as const;

export default function ProposalToolbar({
    form,
    setForm,
    locked,
    fontLocked,
    exec,
}: {
    form: ProposalEditorForm;
    setForm: Dispatch<SetStateAction<ProposalEditorForm>>;
    locked: boolean;
    fontLocked: boolean;
    exec: (cmd: string, val?: string) => void;
}) {
    const [moreOpen, setMoreOpen] = useState(false);
    const moreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!moreOpen) return;

        const onPointerDown = (e: MouseEvent) => {
            if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMoreOpen(false);
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [moreOpen]);

    /**
     * removeFormat only strips inline styling, so links, lists and heading blocks
     * survive it — clear those explicitly to get back to plain body text.
     */
    const clearFormatting = () => {
        exec("removeFormat");
        exec("unlink");

        if (document.queryCommandState("insertUnorderedList")) exec("insertUnorderedList");
        if (document.queryCommandState("insertOrderedList")) exec("insertOrderedList");

        exec("formatBlock", "p");
    };

    const runFromSheet = (action: string | (() => void)) => {
        if (typeof action === "function") action();
        else exec(action);

        setMoreOpen(false);
    };

    const addLink = () => {
        const url = window.prompt("Link URL", "https://");
        if (!url) return;
        exec("createLink", url);
    };

    return (
        <div
            role="toolbar"
            aria-label="Formatting"
            className="max-sm:bg-bg! bg-surface/55 border-divider flex flex-wrap items-center gap-1 border-b px-2.5 py-2"
        >
            <Select
                className={cn(SELECT, "w-[124px]! max-lg:w-[132px]!")}
                aria-label="Paragraph style"
                title="Paragraph style"
                disabled={locked}
                defaultValue="p"
                onChange={(e) => exec("formatBlock", e.target.value)}
            >
                <option value="p">Normal text</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
            </Select>

            <Select
                className={cn(SELECT, "w-[136px]! max-sm:w-[118px]!")}
                aria-label="Font"
                title={fontLocked ? "Font — available on the Pro plan" : "Font"}
                disabled={fontLocked || locked}
                value={form.font}
                onChange={(e) => setForm((s) => ({ ...s, font: e.target.value }))}
            >
                {PROPOSAL_FONTS.map((f) => (
                    <option key={f}>{f}</option>
                ))}
            </Select>

            <Select
                className={cn(SELECT, "w-[62px]!")}
                aria-label="Font size"
                title={fontLocked ? "Font size — available on the Pro plan" : "Font size"}
                disabled={fontLocked || locked}
                value={form.fontSize}
                onChange={(e) => setForm((s) => ({ ...s, fontSize: e.target.value }))}
            >
                {PROPOSAL_FONT_SIZES.map((size) => (
                    <option key={size}>{size}</option>
                ))}
            </Select>

            <span className="bg-divider mx-1.5 h-5 w-px" />

            <ToolButton label="Bold" onClick={() => exec("bold")} disabled={locked}>
                <IconBold />
            </ToolButton>
            <ToolButton label="Italic" onClick={() => exec("italic")} disabled={locked}>
                <IconItalic />
            </ToolButton>
            <ToolButton label="Underline" onClick={() => exec("underline")} disabled={locked}>
                <IconUnderline />
            </ToolButton>
            <ToolButton label="Insert link" onClick={addLink} disabled={locked}>
                <IconLink />
            </ToolButton>

            <span className="bg-divider mx-1.5 h-5 w-px max-lg:hidden" />

            <span className="flex items-center gap-1 max-lg:hidden">
                {ALIGN.map(({ label, cmd, Icon }) => (
                    <ToolButton key={cmd} label={label} onClick={() => exec(cmd)} disabled={locked}>
                        <Icon />
                    </ToolButton>
                ))}
                {LISTS.map(({ label, cmd, Icon }) => (
                    <ToolButton key={cmd} label={label} onClick={() => exec(cmd)} disabled={locked}>
                        <Icon />
                    </ToolButton>
                ))}
                <ToolButton
                    label="Clear formatting"
                    onClick={clearFormatting}
                    disabled={locked}
                >
                    <IconClearFormat />
                </ToolButton>
            </span>

            <div ref={moreRef} className="relative lg:hidden">
                <button
                    type="button"
                    className={cn(BTN, "w-auto gap-1.5 px-2.5", moreOpen && "bg-text/10 text-text")}
                    aria-label="More formatting options"
                    aria-expanded={moreOpen}
                    aria-haspopup="menu"
                    title="More formatting options"
                    disabled={locked}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setMoreOpen((o) => !o)}
                >
                    <IconMore />
                    <span className="font-heading text-[12.5px] font-semibold">More</span>
                </button>

                {moreOpen ? (
                    <>
                        <button
                            type="button"
                            aria-label="Close formatting options"
                            tabIndex={-1}
                            className="fixed inset-0 z-20 hidden cursor-default bg-black/35 max-sm:block"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setMoreOpen(false)}
                        />
                        <div
                            role="menu"
                            aria-label="More formatting options"
                            className="border-divider bg-surface max-sm:bg-bg absolute top-[calc(100%+8px)] right-0 z-30 w-[236px] rounded-[8px] border p-1.5 shadow-[0_12px_34px_rgba(0,0,0,0.16)] max-sm:fixed max-sm:inset-x-0 max-sm:top-auto max-sm:bottom-0 max-sm:w-auto max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0 max-sm:p-3 max-sm:pb-6"
                        >
                            <span
                                aria-hidden
                                className="bg-text/20 mx-auto mb-2 hidden h-1 w-9 rounded-full max-sm:block"
                            />

                            <div className="border-divider mb-1 flex items-center justify-between gap-2 border-b px-1 pb-2">
                                <span className="font-heading text-text text-lg font-semibold">
                                    Formatting
                                </span>
                                <button
                                    type="button"
                                    aria-label="Close formatting options"
                                    title="Close"
                                    className="text-text/65 hover:bg-text/8 hover:text-text inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[5px] max-lg:h-10 max-lg:w-10"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => setMoreOpen(false)}
                                >
                                    <IconClose />
                                </button>
                            </div>

                            <div className="text-text/50 px-2.5 pt-1 pb-1.5 text-[11px] font-semibold tracking-[0.06em] uppercase">
                                Alignment
                            </div>
                            {ALIGN.map(({ label, cmd, Icon }) => (
                                <SheetButton
                                    key={cmd}
                                    label={label}
                                    disabled={locked}
                                    onClick={() => runFromSheet(cmd)}
                                >
                                    <Icon />
                                </SheetButton>
                            ))}

                            <div className="text-text/50 px-2.5 pt-2.5 pb-1.5 text-[11px] font-semibold tracking-[0.06em] uppercase">
                                Lists
                            </div>
                            {LISTS.map(({ label, cmd, Icon }) => (
                                <SheetButton
                                    key={cmd}
                                    label={label}
                                    disabled={locked}
                                    onClick={() => runFromSheet(cmd)}
                                >
                                    <Icon />
                                </SheetButton>
                            ))}

                            <span className="bg-divider my-2 block h-px" />

                            <SheetButton
                                label="Clear formatting"
                                disabled={locked}
                                onClick={() => runFromSheet(clearFormatting)}
                            >
                                <IconClearFormat />
                            </SheetButton>
                        </div>
                    </>
                ) : null}
            </div>

            <span className="flex-1" />
        </div>
    );
}
