import * as React from "react"
import { useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Button, Input, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui';
import api, { resolveImageUrl } from '../lib/api';
import { X, Plus, Upload } from 'lucide-react';

interface ImageOption {
    url: string;
    label?: string;
}

interface Question {
    id?: string;
    key?: string;
    text: string;
    type: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
    imageOptions?: ImageOption[];
    imageChoiceConfig?: {
        multiple?: boolean;
    };
    colorOptions?: { hex: string; name?: string; key?: string }[];
    colorConfig?: { multiple?: boolean };
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
    const { toast } = useToast();
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        open: boolean;
        imageUrl: string;
        imageIndex: number;
    } | null>(null);

    const slugify = (s: string) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const handleDeleteImage = async (imageUrl: string, imageIndex: number) => {
        try {
            // Extrair nome do arquivo da URL
            const urlParts = imageUrl.split('/');
            const imageName = urlParts[urlParts.length - 1];

            // Obter templateId da URL
            let templateId = '';
            if (window.location.pathname.includes('/templates/')) {
                const parts = window.location.pathname.split('/');
                const idx = parts.indexOf('templates');
                if (idx !== -1 && parts[idx + 1]) templateId = parts[idx + 1];
            }

            if (!templateId || templateId === 'new') {
                toast({
                    title: t('question.deleteImageFailed', 'Falha ao deletar imagem'),
                    description: t('question.saveTemplateFirst', 'Salve o template primeiro'),
                    variant: 'destructive',
                });
                return;
            }

            // Chamar endpoint DELETE
            await api.delete(`/templates/${templateId}/images/${imageName}`);

            // Remover da lista de imageOptions
            const newImageOptions = (question.imageOptions || []).filter((_, i) => i !== imageIndex);
            onUpdate({ ...question, imageOptions: newImageOptions });

            toast({
                title: t('question.deleteImageSuccess', 'Imagem deletada com sucesso'),
                variant: 'default',
            });
        } catch (err) {
            console.error('Error deleting image:', err);
            toast({
                title: t('question.deleteImageFailed', 'Falha ao deletar imagem'),
                description: t('question.deleteImageFailedDesc', 'Verifique sua conexão ou tente novamente'),
                variant: 'destructive',
            });
        } finally {
            setDeleteConfirmation(null);
        }
    };

    const questionTypes = [
        { value: 'text', label: t('question.types.text') },
        { value: 'textarea', label: t('question.types.textarea') },
        { value: 'number', label: t('question.types.number') },
        { value: 'select', label: t('question.types.select') },
        { value: 'multiselect', label: t('question.types.multiselect') },
        { value: 'image_choice', label: t('question.types.image_choice', 'Escolha de Imagem') },
        { value: 'color', label: t('question.types.color', 'Seleção de Cor') },
    ];

    return (
        <div className="bg-background border rounded-md p-3 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                        <div className="flex-1">
                            <Input
                                value={question.text}
                                onChange={(e) => onUpdate({ ...question, text: e.target.value })}
                                placeholder={`${t('question.textPlaceholder', 'Texto da Pergunta')} ${index + 1}`}
                                className="h-9"
                                disabled={disabled}
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                value={question.key || ''}
                                onChange={(e) => onUpdate({ ...question, key: e.target.value })}
                                onBlur={(e) => {
                                    if (!e.target.value || e.target.value.trim() === '') {
                                        onUpdate({ ...question, key: slugify(question.text || String(index + 1)) });
                                    }
                                }}
                                placeholder={t('question.keyPlaceholder', 'key (ex: q-garage)')}
                                className="h-9"
                                disabled={disabled}
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                value={question.placeholder || ''}
                                onChange={(e) => onUpdate({ ...question, placeholder: e.target.value })}
                                placeholder={t('question.helpText', 'Texto de ajuda (Placeholder)')}
                                className="h-9"
                                disabled={disabled}
                            />
                        </div>
                        <div className="w-full sm:w-[180px]">
                            <Select
                                value={question.type}
                                onValueChange={(value) => onUpdate({ ...question, type: value })}
                                disabled={disabled}
                            >
                                <SelectTrigger className="h-9 mt-0 sm:mt-0" disabled={disabled}>
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
                            <Label className="text-xs font-semibold uppercase text-muted-foreground mb-2">
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

                    {question.type === 'image_choice' && (
                        <div className="space-y-2 pt-2 border-t mt-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                                {t('question.imageOptions', 'Opções de Imagem')}
                            </Label>
                            <div className="flex items-center gap-4 mb-2">
                                <Checkbox
                                    id={`multiple-${index}`}
                                    checked={!!question.imageChoiceConfig?.multiple}
                                    onCheckedChange={(checked) => {
                                        onUpdate({
                                            ...question,
                                            imageChoiceConfig: {
                                                ...question.imageChoiceConfig,
                                                multiple: !!checked,
                                            },
                                        });
                                    }}
                                    disabled={disabled}
                                />
                                <Label htmlFor={`multiple-${index}`} className="text-sm cursor-pointer">
                                    {t('question.imageChoiceMultiple', 'Permitir seleção múltipla')}
                                </Label>
                            </div>
                            <div className="space-y-2">
                                {(question.imageOptions || []).map((imgOpt, imgIdx) => (
                                    <div key={imgIdx} className="flex items-center gap-2">
                                        <Input
                                            type="text"
                                            value={imgOpt.url}
                                            onChange={(e) => {
                                                const newImageOptions = [...(question.imageOptions || [])];
                                                newImageOptions[imgIdx] = { ...imgOpt, url: e.target.value };
                                                onUpdate({ ...question, imageOptions: newImageOptions });
                                            }}
                                            placeholder={t('question.imageUrl', 'URL da Imagem')}
                                            className="h-8 text-sm flex-1"
                                            disabled={disabled}
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id={`file-upload-${index}-${imgIdx}`}
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                // Tenta obter o templateId do contexto
                                                let templateId = '';
                                                if (window.location.pathname.includes('/templates/')) {
                                                    const parts = window.location.pathname.split('/');
                                                    const idx = parts.indexOf('templates');
                                                    if (idx !== -1 && parts[idx + 1]) templateId = parts[idx + 1];
                                                }

                                                if (!templateId || templateId === 'new') {
                                                    toast({
                                                        title: t('question.saveTemplateFirst', 'Salve o template antes de enviar imagens.'),
                                                        description: t('question.saveTemplateFirstDesc', 'Clique em salvar e depois tente novamente.'),
                                                        variant: 'destructive',
                                                    });
                                                    return;
                                                }

                                                const formData = new FormData();
                                                formData.append('image', file);

                                                try {
                                                    const res = await api.post(`/templates/${templateId}/images`, formData, {
                                                        headers: { 'Content-Type': 'multipart/form-data' },
                                                    });
                                                    const url = res.data.url;
                                                    const newImageOptions = [...(question.imageOptions || [])];
                                                    newImageOptions[imgIdx] = { ...imgOpt, url };
                                                    onUpdate({ ...question, imageOptions: newImageOptions });

                                                    toast({
                                                        title: t('question.uploadSuccess', 'Imagem enviada com sucesso!'),
                                                        variant: 'default',
                                                    });
                                                } catch (err) {
                                                    toast({
                                                        title: t('question.uploadFailed', 'Falha ao enviar imagem.'),
                                                        description: t('question.uploadFailedDesc', 'Verifique sua conexão ou tente novamente.'),
                                                        variant: 'destructive',
                                                    });
                                                }

                                                // Reset input
                                                e.target.value = '';
                                            }}
                                            disabled={disabled}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                document.getElementById(`file-upload-${index}-${imgIdx}`)?.click();
                                            }}
                                            className="h-8 w-8 flex-shrink-0"
                                            disabled={disabled}
                                            title={t('question.uploadImage', 'Upload de Imagem')}
                                        >
                                            <Upload className="h-4 w-4" />
                                        </Button>
                                        <Input
                                            type="text"
                                            value={imgOpt.label || ''}
                                            onChange={(e) => {
                                                const newImageOptions = [...(question.imageOptions || [])];
                                                newImageOptions[imgIdx] = { ...imgOpt, label: e.target.value };
                                                onUpdate({ ...question, imageOptions: newImageOptions });
                                            }}
                                            placeholder={t('question.imageLabel', 'Legenda da Imagem (Opcional)')}
                                            className="h-8 text-sm flex-1"
                                            disabled={disabled}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                                            onClick={() => {
                                                if (imgOpt.url) {
                                                    // Se tem URL, abrir dialog de confirmação
                                                    setDeleteConfirmation({
                                                        open: true,
                                                        imageUrl: imgOpt.url,
                                                        imageIndex: imgIdx
                                                    });
                                                } else {
                                                    // Se não tem URL, apenas remover da lista
                                                    const newImageOptions = (question.imageOptions || []).filter((_, i) => i !== imgIdx);
                                                    onUpdate({ ...question, imageOptions: newImageOptions });
                                                }
                                            }}
                                            disabled={disabled}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                        {imgOpt.url && (
                                            <img
                                                src={resolveImageUrl(imgOpt.url)}
                                                alt={imgOpt.label || ''}
                                                className="h-10 w-10 object-cover rounded border flex-shrink-0"
                                            />
                                        )}
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const newImageOptions = [...(question.imageOptions || []), { url: '', label: '' }];
                                        onUpdate({ ...question, imageOptions: newImageOptions });
                                    }}
                                    className="h-8 border-dashed"
                                    disabled={disabled}
                                >
                                    <Plus className="mr-2 h-3 w-3" />
                                    {t('question.addImageOption', 'Adicionar Opção de Imagem')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {question.type === 'color' && (
                        <div className="space-y-2 pt-2 border-t mt-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                                {t('question.colorOptions', 'Paleta de Cores')}
                            </Label>
                            <div className="flex items-center gap-4 mb-2">
                                <Checkbox
                                    id={`color-multiple-${index}`}
                                    checked={!!question.colorConfig?.multiple}
                                    onCheckedChange={(checked) => onUpdate({ ...question, colorConfig: { ...question.colorConfig, multiple: !!checked } })}
                                    disabled={disabled}
                                />
                                <Label htmlFor={`color-multiple-${index}`} className="text-sm cursor-pointer">
                                    {t('question.colorMultiple', 'Permitir seleção múltipla')}
                                </Label>
                            </div>

                            <div className="space-y-2">
                                {(question.colorOptions || []).map((c, cIdx) => (
                                    <div key={cIdx} className="flex gap-2 items-center">
                                        <input
                                            type="color"
                                            value={c.hex || '#ffffff'}
                                            onChange={(e) => {
                                                const newOptions = [...(question.colorOptions || [])];
                                                newOptions[cIdx] = { ...newOptions[cIdx], hex: e.target.value };
                                                onUpdate({ ...question, colorOptions: newOptions });
                                            }}
                                            disabled={disabled}
                                            className="h-8 w-12 p-0 border rounded"
                                        />
                                        <Input
                                            value={c.name || ''}
                                            onChange={(e) => {
                                                const newOptions = [...(question.colorOptions || [])];
                                                newOptions[cIdx] = { ...newOptions[cIdx], name: e.target.value };
                                                onUpdate({ ...question, colorOptions: newOptions });
                                            }}
                                            placeholder={t('question.colorNamePlaceholder', 'Nome (opcional)')}
                                            className="h-8 text-sm flex-1"
                                            disabled={disabled}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => {
                                                const newOptions = (question.colorOptions || []).filter((_, i) => i !== cIdx);
                                                onUpdate({ ...question, colorOptions: newOptions });
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
                                        const newOptions = [...(question.colorOptions || []), { hex: '#ffffff', name: '' }];
                                        onUpdate({ ...question, colorOptions: newOptions });
                                    }}
                                    className="h-8 border-dashed"
                                    disabled={disabled}
                                >
                                    <Plus className="mr-2 h-3 w-3" />
                                    {t('question.addColorOption', 'Adicionar Cor')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {question.type === 'text' && question.key === 'descreva-o-seu-projeto' && (
                        <div className="space-y-2 pt-2 border-t mt-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                                {t('question.textOptions', 'Opções de Texto')}
                            </Label>
                            <div className="flex items-center gap-4 mb-2">
                                <Checkbox
                                    id={`long-text-${index}`}
                                    checked={!!question.imageChoiceConfig?.multiple} // Reusing multiple for long text, consider a new field if needed
                                    onCheckedChange={(checked) => {
                                        onUpdate({
                                            ...question,
                                            imageChoiceConfig: {
                                                ...question.imageChoiceConfig,
                                                multiple: !!checked,
                                            },
                                        });
                                    }}
                                    disabled={disabled}
                                />
                                <Label htmlFor={`long-text-${index}`} className="text-sm cursor-pointer">
                                    {t('question.longText', 'Texto Longo')}
                                </Label>
                            </div>
                        </div>
                    )}
                </div>
                <Button variant="ghost" size="icon" onClick={onRemove} disabled={disabled} className="flex-shrink-0">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* AlertDialog para confirmação de deleção */}
            <AlertDialog open={deleteConfirmation?.open || false} onOpenChange={(open) => {
                if (!open) setDeleteConfirmation(null);
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('question.deleteImageConfirmTitle', 'Deletar imagem?')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('question.deleteImageConfirmDescription', 'Esta ação não pode ser desfeita. O arquivo será permanentemente removido do servidor.')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('question.cancel', 'Cancelar')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deleteConfirmation) {
                                    handleDeleteImage(deleteConfirmation.imageUrl, deleteConfirmation.imageIndex);
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t('question.delete', 'Deletar')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
