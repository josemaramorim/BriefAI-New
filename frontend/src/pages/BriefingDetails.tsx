import * as React from "react";
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { resolveImageUrl } from '../lib/api';
import ColorChip from '../components/ui/ColorChip';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Mail, Calendar, FileText, ArrowLeft } from 'lucide-react';
import { ModeToggle } from '../components/mode-toggle';

interface Question {
    id: string;
    text: string;
    type: string;
    colorOptions?: any[];
    colorConfig?: any;
}

interface Block {
    id: string;
    title: string;
    questions: Question[];
}

interface Response {
    questionId: string;
    value: any;
}

interface BriefingData {
    id: string;
    status: string;
    updatedAt: string;
    user: {
        name: string;
        email: string;
    };
    template: {
        id: string;
        name: string;
    };
    responses: Response[];
    // We'll also fetch the template structure to render questions correctly
    structure?: {
        blocks: Block[];
    };
}

export default function BriefingDetails() {
    const { id } = useParams();
    const [data, setData] = useState<BriefingData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadDetails();
        }
    }, [id]);

    const loadDetails = async () => {
        try {
            // Fetch instance details
            const instanceRes = await api.get(`/brief-instances/${id}`);
            const instance = instanceRes.data;

            // Fetch template structure (versioned)
            const templateRes = await api.get(`/templates/${instance.templateId}/full`);

            setData({
                ...instance,
                structure: templateRes.data
            });
        } catch (error) {
            console.error('Error loading briefing details:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderValue = (value: any, type: string, question?: Question) => {
        if (value === null || value === undefined || value === '') return <span className="text-muted-foreground italic">Não respondido</span>;

        if (type === 'multiselect' && Array.isArray(value)) {
            return (
                <div className="flex flex-wrap gap-2">
                    {value.map((v, i) => (
                        <Badge key={i} variant="outline" className="bg-slate-50">{v}</Badge>
                    ))}
                </div>
            );
        }

        if (type === 'color') {
            const selections = Array.isArray(value) ? value : [value];
            const opts = Array.isArray(question?.colorOptions) ? question!.colorOptions : [];

            return (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selections.map((sel: any, idx: number) => {
                        // try to match option by id or hex/value, otherwise treat sel as hex or label
                        let opt: any = undefined;
                        if (opts.length) {
                            opt = opts.find(o => o.id === sel || o.hex === sel || o.value === sel || o.hex?.toLowerCase() === String(sel).toLowerCase());
                        }

                        const hex = opt?.hex || (typeof sel === 'string' && /^#/.test(sel) ? sel : undefined);
                        const label = opt?.label || opt?.name || (typeof sel === 'string' && !hex ? sel : undefined);

                        return (
                            <ColorChip key={idx} hex={hex} label={label} />
                        );
                    })}
                </div>
            );
        }

        if (type === 'image_choice') {
            const images = Array.isArray(value) ? value : [value];

            return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                    {images.map((url: any, i: number) => {
                        if (typeof url !== 'string') return null;
                        return (
                            <div key={i} className="flex flex-col items-center p-2 border border-border rounded-xl bg-card shadow-sm overflow-hidden">
                                <img
                                    src={resolveImageUrl(url)}
                                    alt={`Seleção ${i + 1}`}
                                    className="w-full h-24 object-cover rounded-lg"
                                />
                            </div>
                        );
                    })}
                </div>
            );
        }

        return <span className="text-foreground whitespace-pre-wrap">{value.toString()}</span>;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    if (!data) return <div>Erro ao carregar dados.</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            <div>
                <Button variant="ghost" size="sm" asChild className="mb-4">
                    <Link to={`/templates/${data.template.id}/results`} className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Voltar para lista
                    </Link>
                </Button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                {data.template.name}
                            </Badge>
                            <Badge variant={data.status === 'completed' ? 'default' : 'secondary'}>
                                {data.status === 'completed' ? 'Concluído' : 'Rascunho'}
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                            {data.user?.name}
                        </h1>
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {data.user?.email}</span>
                            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(data.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <ModeToggle />
                        <Button variant="outline" className="gap-2 flex-1 md:flex-none" onClick={() => window.print()}>
                            <FileText className="h-4 w-4" />
                            Imprimir / PDF
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-8">
                {data.structure?.blocks.map((block) => (
                    <Card key={block.id} className="border-border overflow-hidden shadow-sm">
                        <CardHeader className="bg-muted/50 border-b">
                            <CardTitle className="text-xl font-bold text-foreground">{block.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {block.questions.map((question) => {
                                    const response = data.responses.find(r => r.questionId === question.id);
                                    return (
                                        <div key={question.id} className="p-6 space-y-2 hover:bg-accent/50 transition-colors">
                                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                                {question.text}
                                            </p>
                                            <div className="text-lg">
                                                {renderValue(response?.value, question.type, question)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
