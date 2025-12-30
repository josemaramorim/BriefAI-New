import React from 'react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

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

    // Helper to resolve image URLs (handles relative paths from backend)
    const resolveImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        // Prefix with API base URL if relative
        const baseURL = 'http://localhost:3001'; // Should match api.ts
        return `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`;
    };

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
                const selectedMulti = Array.isArray(value) ? value : [];
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {options.map((option: string, i: number) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex items-center space-x-3 p-4 border rounded-xl transition-all cursor-pointer hover:bg-slate-50",
                                    selectedMulti.includes(option) ? 'border-primary bg-primary/5' : 'border-slate-200'
                                )}
                                onClick={() => {
                                    if (disabled) return;
                                    const next = selectedMulti.includes(option)
                                        ? selectedMulti.filter((v: any) => v !== option)
                                        : [...selectedMulti, option];
                                    onChange(next);
                                }}
                            >
                                <Checkbox
                                    checked={selectedMulti.includes(option)}
                                    className="h-5 w-5 rounded-md"
                                />
                                <span className="text-slate-700 font-medium">{option}</span>
                            </div>
                        ))}
                    </div>
                );
            case 'image_choice':
                const imageOptions = Array.isArray(question.options) ? question.options : [];
                const selectedImage = Array.isArray(value) ? value : [];
                const multiple = question.imageChoiceConfig?.multiple;

                return (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {imageOptions.map((imgOpt: any, i: number) => (
                            <div
                                key={i}
                                className={cn(
                                    "relative border rounded-lg overflow-hidden cursor-pointer",
                                    "hover:shadow-lg transition-shadow duration-200",
                                    selectedImage.includes(imgOpt.url) ? 'border-primary ring-2 ring-primary' : 'border-gray-200'
                                )}
                                onClick={() => {
                                    if (disabled) return;
                                    let nextSelection;
                                    if (multiple) {
                                        nextSelection = selectedImage.includes(imgOpt.url)
                                            ? selectedImage.filter((url: string) => url !== imgOpt.url)
                                            : [...selectedImage, imgOpt.url];
                                    } else {
                                        nextSelection = selectedImage.includes(imgOpt.url) ? [] : [imgOpt.url];
                                    }
                                    onChange(nextSelection);
                                }}
                            >
                                <img src={resolveImageUrl(imgOpt.url)} alt={imgOpt.label || 'Image option'} className="w-full h-32 object-cover" />
                                {imgOpt.label && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                                        {imgOpt.label}
                                    </div>
                                )}
                                {selectedImage.includes(imgOpt.url) && (
                                    <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                                        <X className="h-4 w-4 text-white" />
                                    </div>
                                )}
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
