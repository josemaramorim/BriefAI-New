import * as React from "react";
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { resolveImageUrl } from '../lib/api';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';
import ColorChip from './ui/ColorChip';
import { ColorPicker } from './ui/ColorPicker';

interface Question {
    id: string;
    text: string;
    type: string;
    required: boolean;
    placeholder?: string;
    options?: string[] | any; // Json from prisma
    imageOptions?: {
        url: string;
        label?: string;
    }[];
    imageChoiceConfig?: {
        multiple: boolean;
    };
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
            console.log(`Rendering question ${question.id} (${question.text}) with value: `, value);
        }

        const safeValue = value !== undefined && value !== null ? value : '';

        switch (question.type) {
            case 'color':
            case 'cor': {
                // Suporte a seleção única ou múltipla
                const palette = Array.isArray(question.options) ? question.options : [
                    '#FFFFFF', '#000000', '#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#2196F3', '#4CAF50', '#FFEB3B', '#FF9800', '#795548', '#607D8B'
                ];
                const multiple = question.imageChoiceConfig?.multiple || question.multiple;
                const selectedColors = multiple ? (Array.isArray(value) ? value : []) : value ? [value] : [];

                const handleSelect = (color: string) => {
                    if (disabled) return;
                    if (multiple) {
                        const next = selectedColors.includes(color)
                            ? selectedColors.filter((c: string) => c !== color)
                            : [...selectedColors, color];
                        onChange(next);
                    } else {
                        onChange(color);
                    }
                };

                return (
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {palette.map((color: string, i: number) => (
                                <button
                                    key={color + i}
                                    type="button"
                                    className={cn(
                                        'p-0.5 rounded border-2',
                                        selectedColors.includes(color) ? 'border-primary ring-2 ring-primary' : 'border-transparent'
                                    )}
                                    style={{ background: 'none' }}
                                    onClick={() => handleSelect(color)}
                                    disabled={disabled}
                                    aria-label={`Selecionar cor ${color}`}
                                >
                                    <ColorChip hex={color} size={28} />
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <ColorPicker
                                value={selectedColors[selectedColors.length - 1] || ''}
                                onChange={handleSelect}
                                disabled={disabled}
                            />
                            <span className="text-sm text-muted-foreground">Escolher cor personalizada</span>
                        </div>
                        {multiple && selectedColors.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedColors.map((color: string, i: number) => (
                                    <ColorChip key={color + i} hex={color} size={20} />
                                ))}
                            </div>
                        )}
                    </div>
                );
            }
            case 'textarea':
                return (
                    <Textarea
                        value={safeValue}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={question.placeholder}
                        disabled={disabled}
                        className="min-h-[120px] text-base bg-background border-input focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
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
                        className="h-12 text-lg bg-background border-input focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                    />
                );
            case 'select':
                return (
                    <Select
                        value={safeValue}
                        onValueChange={onChange}
                        disabled={disabled}
                    >
                        <SelectTrigger className="h-12 text-lg bg-background border-input focus:border-primary focus:ring-primary/20 transition-all rounded-xl">
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
                                    "flex items-center space-x-3 p-4 border rounded-xl transition-all cursor-pointer hover:bg-accent",
                                    selectedMulti.includes(option) ? 'border-primary bg-primary/5' : 'border-input'
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
                                <span className="text-foreground font-medium">{option}</span>
                            </div>
                        ))}
                    </div>
                );
            case 'image_choice':
                const imageOptions = Array.isArray(question.imageOptions) ? question.imageOptions : [];
                // Handle both single string values and arrays of strings
                const selectedImage = Array.isArray(value) ? value : (value ? [value] : []);
                const multiple = question.imageChoiceConfig?.multiple;

                return (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {imageOptions.map((imgOpt: any, i: number) => {
                            const isSelected = selectedImage.includes(imgOpt.url);
                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "relative border rounded-lg overflow-hidden cursor-pointer",
                                        "hover:shadow-lg transition-shadow duration-200",
                                        isSelected ? 'border-primary ring-2 ring-primary' : 'border-input'
                                    )}
                                    onClick={() => {
                                        if (disabled) return;
                                        let nextSelection;
                                        if (multiple) {
                                            nextSelection = isSelected
                                                ? selectedImage.filter((url: string) => url !== imgOpt.url)
                                                : [...selectedImage, imgOpt.url];
                                        } else {
                                            nextSelection = isSelected ? [] : [imgOpt.url];
                                            // For single choice, we can keep it as a string instead of array if desired, 
                                            // but keeping as array for consistency with Rule Engine is safer.
                                            // However, the user asked "is it a string?", so let's support saving as string for single choice.
                                            if (nextSelection.length === 1) nextSelection = nextSelection[0];
                                            else if (nextSelection.length === 0) nextSelection = '';
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
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                                            <X className="h-4 w-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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
                        className="h-12 text-lg bg-background border-input focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                    />
                );
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-1.5">
                <Label className="text-xl font-semibold text-foreground flex items-start gap-2">
                    {question.text}
                    {question.required && <span className="text-rose-500 text-sm">*</span>}
                </Label>
            </div>
            {renderInput()}
        </div>
    );
}
