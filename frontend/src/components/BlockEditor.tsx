import React from 'react';
import { useTranslation } from 'react-i18next';
import QuestionEditor from './QuestionEditor';
import { Button, Input } from './ui';
import { Trash2, Plus } from 'lucide-react';

interface Question {
    id?: string;
    text: string;
    type: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
}

interface Block {
    id?: string;
    title: string;
    description?: string;
    order: number;
    parentId?: string | null;
    questions: Question[];
}

interface BlockEditorProps {
    block: Block;
    index: number;
    onUpdate: (block: Block) => void;
    onRemove: () => void;
    disabled?: boolean;
}

export default function BlockEditor({ block, index, onUpdate, onRemove, disabled }: BlockEditorProps) {
    const { t } = useTranslation();

    const addQuestion = () => {
        onUpdate({
            ...block,
            questions: [
                ...block.questions,
                {
                    text: '',
                    type: 'text',
                    required: false,
                },
            ],
        });
    };

    const updateQuestion = (qIndex: number, updatedQuestion: Question) => {
        const newQuestions = [...block.questions];
        newQuestions[qIndex] = updatedQuestion;
        onUpdate({ ...block, questions: newQuestions });
    };

    const removeQuestion = (qIndex: number) => {
        onUpdate({
            ...block,
            questions: block.questions.filter((_, i) => i !== qIndex),
        });
    };

    return (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
            <div className="flex items-start gap-4">
                <div className="flex-1 space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                        {t('block.title')} {index + 1}
                    </label>
                    <Input
                        value={block.title}
                        onChange={(e) => onUpdate({ ...block, title: e.target.value })}
                        placeholder={t('block.titlePlaceholder')}
                        className="bg-background"
                        disabled={disabled}
                    />
                </div>
                <div className="flex-1 space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                        {t('block.description', 'Objetivo/Descrição do Bloco')}
                    </label>
                    <Input
                        value={block.description || ''}
                        onChange={(e) => onUpdate({ ...block, description: e.target.value })}
                        placeholder={t('block.descriptionPlaceholder', 'Descreva o objetivo deste bloco...')}
                        className="bg-background"
                        disabled={disabled}
                    />
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    className="mt-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    title={t('block.remove')}
                    disabled={disabled}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Questions */}
            <div className="space-y-4">
                {block.questions.map((question, qIndex) => (
                    <QuestionEditor
                        key={qIndex}
                        question={question}
                        index={qIndex}
                        onUpdate={(updatedQuestion) => updateQuestion(qIndex, updatedQuestion)}
                        onRemove={() => removeQuestion(qIndex)}
                        disabled={disabled}
                    />
                ))}
            </div>

            <Button
                variant="outline"
                onClick={addQuestion}
                className="w-full border-dashed border-2 hover:border-primary hover:text-primary bg-background"
                disabled={disabled}
            >
                <Plus className="mr-2 h-4 w-4" />
                {t('block.addQuestion')}
            </Button>
        </div>
    );
}
