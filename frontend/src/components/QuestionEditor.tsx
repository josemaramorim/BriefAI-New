import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { X, Plus } from 'lucide-react';

interface Question {
    id?: string;
    key?: string;
    text: string;
    type: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
}

interface QuestionEditorProps {
    question: Question;
    index: number;
    onUpdate: (question: Question) => void;
    onRemove: () => void;
    disabled?: boolean;
}

export default function QuestionEditor({ question, index, onUpdate, onRemove, disabled }: QuestionEditorProps) {
    const { t } = useTranslation();

    const slugify = (s: string) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const questionTypes = [
        { value: 'text', label: t('question.types.text') },
        { value: 'textarea', label: t('question.types.textarea') },
        { value: 'number', label: t('question.types.number') },
        { value: 'select', label: t('question.types.select') },
        { value: 'multiselect', label: t('question.types.multiselect') },
    ];

    return (
        <div className="bg-background border rounded-md p-3 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1">
                            <Input
                                value={question.text}
                                onChange={(e) => onUpdate({ ...question, text: e.target.value })}
                                placeholder={`${t('question.textPlaceholder', 'Texto da Pergunta')} ${index + 1}`}
                                className="h-9"
                                disabled={disabled}
                            />
                        </div>
                        <div className="w-48">
                            <Input
                                value={question.key || ''}
                                onChange={(e) => onUpdate({ ...question, key: e.target.value })}
                                onBlur={(e) => {
                                    if(!e.target.value || e.target.value.trim() === ''){
                                        onUpdate({ ...question, key: slugify(question.text || String(index+1)) });
                                    }
                                }}
                                placeholder={t('question.keyPlaceholder', 'key (ex: q-garage)')}
                                className="h-9 text-xs"
                                disabled={disabled}
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                value={question.placeholder || ''}
                                onChange={(e) => onUpdate({ ...question, placeholder: e.target.value })}
                                placeholder={t('question.helpText', 'Texto de ajuda (Placeholder)')}
                                className="h-9 text-xs"
                                disabled={disabled}
                            />
                        </div>
                        <div className="w-full sm:w-[180px]">
                            <Select
                                value={question.type}
                                onValueChange={(value) => onUpdate({ ...question, type: value })}
                                disabled={disabled}
                            >
                                <SelectTrigger className="h-9" disabled={disabled}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {questionTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={`required-${index}`}
                            checked={question.required}
                            onCheckedChange={(checked) => onUpdate({ ...question, required: !!checked })}
                            disabled={disabled}
                        />
                        <Label
                            htmlFor={`required-${index}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                        >
                            {t('question.required')}
                        </Label>
                    </div>

                    {(question.type === 'select' || question.type === 'multiselect') && (
                        <div className="space-y-2 pt-2 border-t mt-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">
                                {t('question.options', 'Opções de Resposta')}
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {(question.options || []).map((option, optIndex) => (
                                    <div key={optIndex} className="flex gap-2 items-center">
                                        <Input
                                            value={option}
                                            onChange={(e) => {
                                                const newOptions = [...(question.options || [])];
                                                newOptions[optIndex] = e.target.value;
                                                onUpdate({ ...question, options: newOptions });
                                            }}
                                            placeholder={`${t('question.option')} ${optIndex + 1}`}
                                            className="h-8 text-sm"
                                            disabled={disabled}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => {
                                                const newOptions = (question.options || []).filter((_, i) => i !== optIndex);
                                                onUpdate({ ...question, options: newOptions });
                                            }}
                                            disabled={disabled}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const newOptions = [...(question.options || []), ''];
                                        onUpdate({ ...question, options: newOptions });
                                    }}
                                    className="h-8 border-dashed"
                                    disabled={disabled}
                                >
                                    <Plus className="mr-2 h-3 w-3" />
                                    {t('question.addOption', 'Adicionar Opção')}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title={t('question.remove')}
                    disabled={disabled}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
