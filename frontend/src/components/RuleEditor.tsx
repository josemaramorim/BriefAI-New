import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import RuleAssistant from './RuleAssistant';
import ActionAssistant from './ActionAssistant';
import { X } from 'lucide-react';

interface Rule {
    id?: string;
    expression: string;
    action: string;
}

interface TargetItem {
    label: string;
    value: string;
    type: string;
}

interface RuleEditorProps {
    rule: Rule;
    index: number;
    onUpdate: (rule: Rule) => void;
    onRemove: () => void;
    disabled?: boolean;
    availableKeys?: TargetItem[];
    blocks?: { id?: string; title: string }[];
}

export default function RuleEditor({ rule, index, onUpdate, onRemove, disabled, availableKeys, blocks = [] }: RuleEditorProps) {
    const { t } = useTranslation();

    const keys = availableKeys || [];
    const exprRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [pickerOpen, setPickerOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [highlight, setHighlight] = React.useState(0);
    const searchRef = React.useRef<HTMLInputElement | null>(null);
    const [tokenRange, setTokenRange] = React.useState<{ start: number; end: number } | null>(null);
    const [popPos, setPopPos] = React.useState<{ left: number; top: number } | null>(null);
    const [assistantOpen, setAssistantOpen] = React.useState(false);
    const [actionAssistantOpen, setActionAssistantOpen] = React.useState(false);

    const filtered = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return keys;
        return keys.filter((k) => k.label.toLowerCase().includes(q) || k.value.toLowerCase().includes(q));
    }, [keys, search]);

    const insertAtCursor = (valueToInsert: string) => {
        const el = exprRef.current;
        if (!el) return;
        let start = el.selectionStart ?? el.value.length;
        let end = el.selectionEnd ?? el.value.length;
        if (tokenRange) {
            start = tokenRange.start;
            end = tokenRange.end;
        }
        const before = el.value.substring(0, start);
        const after = el.value.substring(end);
        const newVal = before + valueToInsert + after;
        onUpdate({ ...rule, expression: newVal });
        // set focus and caret after inserted text
        requestAnimationFrame(() => {
            el.focus();
            const pos = start + valueToInsert.length;
            el.setSelectionRange(pos, pos);
            setTokenRange(null);
        });
    };

    const formatAndInsert = (key: string) => {
        const el = exprRef.current;
        const v = el?.value ?? '';
        if (!el) return insertAtCursor(`\"questionId\":\"${key}\"`);
        // detect if caret/token is inside a quoted string
        const start = tokenRange ? tokenRange.start : (el.selectionStart ?? v.length);
        const end = tokenRange ? tokenRange.end : (el.selectionEnd ?? v.length);
        const lq = v.lastIndexOf('"', Math.max(0, start - 1));
        const rq = v.indexOf('"', end);
        const insideQuotes = lq !== -1 && rq !== -1 && lq < start && rq >= end;
        if (insideQuotes) {
            // insert only key (assumes we're inside value quotes)
            insertAtCursor(key);
        } else {
            // default: insert full JSON pair
            insertAtCursor(`\"questionId\":\"${key}\"`);
        }
    };

    const detectTokenAtCaret = () => {
        const el = exprRef.current;
        if (!el) return;
        const pos = el.selectionStart ?? el.value.length;
        const v = el.value;
        // token chars: letters, numbers, hyphen, underscore
        let s = pos;
        while (s > 0 && /[a-z0-9_-]/i.test(v.charAt(s - 1))) s--;
        let e = pos;
        while (e < v.length && /[a-z0-9_-]/i.test(v.charAt(e))) e++;
        const token = v.substring(s, e);
        if (token.length >= 1) {
            setTokenRange({ start: s, end: e });
            setSearch(token);
            setPickerOpen(true);
            // compute caret coords and position popover (guard against any errors)
            try {
                const coords = getCaretCoordinates(el, s);
                setPopPos({ left: coords.left, top: coords.top + coords.height });
            } catch (err) {
                // fallback: clear popPos so the picker renders in-flow
                setPopPos(null);
                // avoid breaking typing if coords calculation fails
                console.debug('getCaretCoordinates failed', err);
            }
            setHighlight(0);
            // do NOT steal focus from textarea when opening suggestions while typing
        } else {
            setTokenRange(null);
            // do not auto-close; keep picker open only if user toggled it
            // setPickerOpen(false);
        }
    };

    // Compute caret coordinates (basic mirror div approach). Returns coords relative to viewport.
    const getCaretCoordinates = (textarea: HTMLTextAreaElement, position: number) => {
        const div = document.createElement('div');
        const style = getComputedStyle(textarea);
        const rect = textarea.getBoundingClientRect();
        // copy textarea styles
        div.style.whiteSpace = 'pre-wrap';
        div.style.wordWrap = 'break-word';
        div.style.position = 'absolute';
        div.style.visibility = 'hidden';
        div.style.top = '0px';
        div.style.left = '-9999px';
        div.style.font = style.font;
        div.style.lineHeight = style.lineHeight;
        div.style.padding = style.padding;
        div.style.border = style.border;
        div.style.width = `${textarea.offsetWidth}px`;
        const text = textarea.value.substring(0, position);
        // replace spaces with nbsp to preserve
        const span = document.createElement('span');
        div.textContent = text;
        span.textContent = textarea.value.substring(position) || '.';
        div.appendChild(span);
        document.body.appendChild(div);
        const spanRect = span.getBoundingClientRect();
        const left = rect.left + spanRect.left - div.getBoundingClientRect().left - textarea.scrollLeft;
        const top = rect.top + spanRect.top - div.getBoundingClientRect().top - textarea.scrollTop;
        const height = spanRect.height || parseInt(style.lineHeight || '16', 10);
        document.body.removeChild(div);
        return { left: left + window.scrollX, top: top + window.scrollY, height };
    };

    return (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">
                    {t('rule.title')} {index + 1}
                </h4>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title={t('rule.remove')}
                    disabled={disabled}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {t('rule.condition')}
                    </Label>
                    <Textarea
                        ref={exprRef}
                        value={rule.expression}
                        onChange={(e) => onUpdate({ ...rule, expression: e.target.value })}
                        onKeyUp={() => detectTokenAtCaret()}
                        onInput={() => detectTokenAtCaret()}
                        onClick={() => detectTokenAtCaret()}
                        onKeyDown={(e) => {
                            if (!pickerOpen) {
                                // allow Tab to insert tab character when picker is closed
                                if (e.key === 'Tab') {
                                    e.preventDefault();
                                    const el = exprRef.current;
                                    if (!el) return;
                                    const start = el.selectionStart ?? 0;
                                    const end = el.selectionEnd ?? 0;
                                    const before = el.value.substring(0, start);
                                    const after = el.value.substring(end);
                                    const newVal = before + '\t' + after;
                                    onUpdate({ ...rule, expression: newVal });
                                    requestAnimationFrame(() => {
                                        el.focus();
                                        const pos = start + 1;
                                        el.setSelectionRange(pos, pos);
                                    });
                                }
                                return;
                            }
                            if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => Math.min(h + 1, filtered.length - 1)); }
                            else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)); }
                            else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); const v = filtered[highlight]; if (v) { formatAndInsert(v.value); setPickerOpen(false); setSearch(''); } }
                            else if (e.key === 'Escape') { e.preventDefault(); setPickerOpen(false); }
                        }}
                        rows={4}
                        className="font-mono text-xs bg-background resize-y"
                        placeholder={t('rule.conditionPlaceholder')}
                        disabled={disabled}
                    />
                    <p className="text-[10px] text-muted-foreground/80 leading-tight">
                        {t('rule.conditionExample')}
                    </p>
                    {keys && keys.length > 0 && (
                        <div className="pt-2">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 relative">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPickerOpen((s) => !s);
                                                setTimeout(() => searchRef.current?.focus(), 50);
                                            }}
                                            className="text-xs bg-muted/10 px-2 py-1 rounded"
                                            aria-haspopup="listbox"
                                            aria-expanded={pickerOpen}
                                        >
                                            {t('rule.insertKeyPlaceholder', 'Inserir chave...')}
                                        </button>
                                        <Button variant="secondary" size="sm" onClick={() => setAssistantOpen(true)} className="text-xs px-2 py-1" title={t('rule.assistantButton', 'Assistente')} aria-label={t('rule.assistantButton', 'Assistente')}>{t('rule.assistantButton', 'Assistente')}</Button>
                                    </div>

                                    {pickerOpen && (
                                        <div style={popPos ? { position: 'fixed', left: popPos.left, top: popPos.top, zIndex: 9999, width: 320, maxHeight: '16rem', overflow: 'auto' } : undefined} className="rounded border bg-popover p-2 shadow-lg">
                                            <input
                                                ref={searchRef}
                                                value={search}
                                                onChange={(e) => { setSearch(e.target.value); setHighlight(0); }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => Math.min(h + 1, filtered.length - 1)); }
                                                    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)); }
                                                    if (e.key === 'Escape') { setPickerOpen(false); }
                                                    if (e.key === 'Enter') { e.preventDefault(); const v = filtered[highlight]; if (v) { formatAndInsert(v.value); setPickerOpen(false); setSearch(''); } }
                                                }}
                                                className="w-full text-sm px-2 py-1 mb-2 border rounded"
                                                placeholder={t('rule.searchPlaceholder', 'Pesquisar...')}
                                            />
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between px-2 mb-1">
                                                    <div className="text-xs text-muted-foreground">{t('rule.searchResults', 'Resultados')}</div>
                                                    <div className="text-[10px] text-muted-foreground">{filtered.length}</div>
                                                </div>
                                                <ul role="listbox" aria-label={t('rule.insertKey')} className="space-y-1">
                                                    {filtered.slice(0, 200).map((k, i) => (
                                                        <li
                                                            key={k.value}
                                                            role="option"
                                                            aria-selected={highlight === i}
                                                            onMouseEnter={() => setHighlight(i)}
                                                            onClick={() => { formatAndInsert(k.value); setPickerOpen(false); setSearch(''); }}
                                                            className={`px-2 py-2 rounded cursor-pointer ${highlight === i ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/10'}`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="text-sm font-medium">{k.label}</div>
                                                                <div className="text-[10px] uppercase bg-secondary px-1 rounded text-secondary-foreground">{k.type === 'block' ? 'Bloco' : 'Pergunta'}</div>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground mt-1 font-mono">{k.value}</div>
                                                        </li>
                                                    ))}
                                                    {filtered.length === 0 && <li className="text-xs text-muted-foreground px-2">{t('rule.noResults', 'Nenhum resultado')}</li>}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {/* small preview of popular keys (desktop) */}
                                    <div className="hidden md:flex flex-wrap gap-2">
                                        {keys.slice(0, 8).map(k => (
                                            <button key={k.value} type="button" onClick={() => formatAndInsert(k.value)} className="text-xs bg-muted/20 px-2 py-1 rounded hover:bg-muted/30">{k.label}</button>
                                        ))}
                                        {keys.length > 8 && (
                                            <button type="button" onClick={() => setPickerOpen(true)} className="text-xs text-muted-foreground px-2 py-1">+{keys.length - 8}</button>
                                        )}
                                    </div>
                                </div>
                                <RuleAssistant open={assistantOpen} onOpenChange={setAssistantOpen} availableKeys={keys} onInsertAction={(json) => onUpdate({ ...rule, expression: json })} />
                            </div>
                            <p className="text-[10px] text-muted-foreground/70">{t('rule.availableKeysHint', 'Available question keys')}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {t('rule.action')}
                    </Label>
                    <Textarea
                        value={rule.action}
                        onChange={(e) => onUpdate({ ...rule, action: e.target.value })}
                        onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                                e.preventDefault();
                                const el = e.currentTarget as HTMLTextAreaElement;
                                const start = el.selectionStart ?? 0;
                                const end = el.selectionEnd ?? 0;
                                const before = el.value.substring(0, start);
                                const after = el.value.substring(end);
                                const newVal = before + '\t' + after;
                                onUpdate({ ...rule, action: newVal });
                                requestAnimationFrame(() => {
                                    el.focus();
                                    const pos = start + 1;
                                    el.setSelectionRange(pos, pos);
                                });
                            }
                        }}
                        rows={4}
                        className="font-mono text-xs bg-background resize-y"
                        placeholder={t('rule.actionPlaceholder')}
                        disabled={disabled}
                    />
                    <p className="text-[10px] text-muted-foreground/80 leading-tight">
                        {t('rule.actionTypes')}
                    </p>
                    <div className="pt-2">
                        <div className="flex items-center gap-2">
                            <Button variant="secondary" size="sm" onClick={() => setActionAssistantOpen(true)} className="text-xs px-2 py-1" title={t('rule.assistantButton', 'Assistente')} aria-label={t('rule.assistantButton', 'Assistente')}>{t('rule.assistantButton', 'Assistente')}</Button>
                            <ActionAssistant
                                open={actionAssistantOpen}
                                onOpenChange={setActionAssistantOpen}
                                availableBlocks={Array.isArray(blocks) ? blocks.map(b => ({ id: b.id || '', title: b.title || '' })) : []}
                                availableQuestions={Array.isArray(keys) ? keys.map(k => ({ key: k.value, text: k.label })) : []}
                                onInsertAction={(json) => onUpdate({ ...rule, action: json })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
