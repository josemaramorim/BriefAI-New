import React from 'react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';

interface Question {
    id: string;
    text: string;
    type: string;
    required: boolean;
    placeholder?: string;
    options?: string[] | any; // Json from prisma
}

interface QuestionRendererProps {
    question: Question;
    value: any;
    onChange: (value: any) => void;
    disabled?: boolean;
}

export default function QuestionRenderer({ question, value, onChange, disabled }: QuestionRendererProps) {
    const options = Array.isArray(question.options) ? question.options : [];

    const renderInput = () => {
        // Debug log for each question render
        if (value !== undefined) {
            console.log(`Rendering question ${question.id} (${question.text}) with value:`, value);
        }

        const safeValue = value !== undefined && value !== null ? value : '';

        switch (question.type) {
            case 'textarea':
                return (
                    <Textarea
                        value={safeValue}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={question.placeholder}
                        disabled={disabled}
                        className="min-h-[120px] text-base bg-white border-slate-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                    />
                );
            case 'number':
                return (
                    <Input
                        type="number"
                        value={safeValue}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={question.placeholder}
                        disabled={disabled}
                        className="h-12 text-lg bg-white border-slate-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                    />
                );
            case 'select':
                return (
                    <Select
                        value={safeValue}
                        onValueChange={onChange}
                        disabled={disabled}
                    >
                        <SelectTrigger className="h-12 text-lg bg-white border-slate-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl">
                            <SelectValue placeholder={question.placeholder || "Selecione uma opção"} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option: string, i: number) => (
                                <SelectItem key={i} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case 'multiselect':
                const selected = Array.isArray(value) ? value : [];
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {options.map((option: string, i: number) => (
                            <div
                                key={i}
                                className={`flex items-center space-x-3 p-4 border rounded-xl transition-all cursor-pointer hover:bg-slate-50 ${selected.includes(option) ? 'border-primary bg-primary/5' : 'border-slate-200'
                                    }`}
                                onClick={() => {
                                    if (disabled) return;
                                    const next = selected.includes(option)
                                        ? selected.filter((v: any) => v !== option)
                                        : [...selected, option];
                                    onChange(next);
                                }}
                            >
                                <Checkbox
                                    checked={selected.includes(option)}
                                    className="h-5 w-5 rounded-md"
                                />
                                <span className="text-slate-700 font-medium">{option}</span>
                            </div>
                        ))}
                    </div>
                );
            default: // text
                return (
                    <Input
                        type="text"
                        value={safeValue}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={question.placeholder}
                        disabled={disabled}
                        className="h-12 text-lg bg-white border-slate-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                    />
                );
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-1.5">
                <Label className="text-xl font-semibold text-slate-800 flex items-start gap-2">
                    {question.text}
                    {question.required && <span className="text-rose-500 text-sm">*</span>}
                </Label>
            </div>
            {renderInput()}
        </div>
    );
}
