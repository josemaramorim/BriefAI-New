import React from 'react';
import { useTranslation } from 'react-i18next';
import AssistantBase from './AssistantBase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableBlocks?: { id: string; title: string }[];
    availableQuestions?: { key: string; text: string }[];
    onInsertAction: (json: string) => void;
}

const actionTypes = [
    { value: 'activate_block', label: 'Ativar Bloco', params: ['targetId'] },
    { value: 'deactivate_block', label: 'Desativar Bloco', params: ['targetId'] },
    { value: 'activate_question', label: 'Ativar Pergunta', params: ['targetId'] },
    { value: 'skip_question', label: 'Pular Pergunta', params: ['targetId'] },
    { value: 'set_metadata', label: 'Definir Metadados', params: ['key', 'value'] },
    { value: 'end_briefing', label: 'Encerrar Briefing', params: [] },
];

export default function ActionAssistant({ open, onOpenChange, availableBlocks = [], availableQuestions = [], onInsertAction }: Props) {
    const { t } = useTranslation();
    const [actionType, setActionType] = React.useState<string | null>(null);
    const [params, setParams] = React.useState<Record<string, string>>({});
    const [scope, setScope] = React.useState<'briefing' | 'block' | 'question'>('briefing');

    const reset = () => {
        setActionType(null);
        setParams({});
    };

    const handleInsert = () => {
        if (!actionType) return;
        let action: any = { type: actionType, ...params };
        if (actionType === 'set_metadata') {
            action.scope = scope;
        }
        onInsertAction(JSON.stringify(action, null, 2));
        onOpenChange(false);
        reset();
    };

    const selectedAction = actionTypes.find(a => a.value === actionType);

    return (
        <AssistantBase
            open={open}
            onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}
            title={t('rule.assistantButton', 'Assistente de Ação')}
            onCancel={() => { onOpenChange(false); reset(); }}
            onConfirm={handleInsert}
            confirmText={t('common.insert', 'Inserir')}
            confirmDisabled={!actionType}
            type="dialog"
        >
            <div className="space-y-4 p-4">
                <div className="space-y-2">
                    <Label>{t('rule.actionType', 'Tipo de Ação')}</Label>
                    <Select onValueChange={setActionType} value={actionType || ''}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('rule.selectActionType', 'Selecione um tipo de ação...')} />
                        </SelectTrigger>
                        <SelectContent>
                            {actionTypes.map(at => (
                                <SelectItem key={at.value} value={at.value}>{at.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Se for set_metadata, mostrar seleção de escopo */}
                {actionType === 'set_metadata' && (
                    <div className="space-y-2">
                        <Label>Escopo</Label>
                        <Select value={scope} onValueChange={v => setScope(v as any)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o escopo..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="briefing">Briefing</SelectItem>
                                <SelectItem value="block">Bloco</SelectItem>
                                <SelectItem value="question">Pergunta</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {selectedAction && selectedAction.params.map(param => {
                    let isBlockAction = actionType === 'activate_block' || actionType === 'deactivate_block';
                    let isQuestionAction = actionType === 'skip_question' || actionType === 'activate_question';
                    return (
                        <div key={param} className="space-y-2">
                            <Label>{param}</Label>
                            {param === 'targetId' && isBlockAction && availableBlocks.length > 0 ? (
                                <Select
                                    value={params[param] || ''}
                                    onValueChange={v => setParams(p => ({ ...p, [param]: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('block.selectBlock', 'Selecione um bloco...')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableBlocks.map(block => (
                                            <SelectItem key={block.id} value={block.id}>{block.title || block.id}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : param === 'targetId' && isQuestionAction && availableQuestions.length > 0 ? (
                                <Select
                                    value={params[param] || ''}
                                    onValueChange={v => setParams(p => ({ ...p, [param]: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('question.selectQuestion', 'Selecione uma pergunta...')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableQuestions.map(q => (
                                            <SelectItem key={q.key} value={q.key}>{q.text || q.key}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    value={params[param] || ''}
                                    onChange={e => setParams(p => ({ ...p, [param]: e.target.value }))}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </AssistantBase>
    );
}