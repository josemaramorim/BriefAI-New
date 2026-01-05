import * as React from "react";
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import ColorChip from '../components/ui/ColorChip';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { ChevronRight, User, Mail, Calendar, CheckCircle2, Clock } from 'lucide-react';

interface BriefInstance {
    id: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    user: {
        name: string;
        email: string;
    };
    _count: {
        responses: number;
    };
}

interface TemplateInfo {
    id: string;
    name: string;
    description?: string;
}

export default function BriefingResults() {
    const { id: templateId } = useParams();
    const [instances, setInstances] = useState<BriefInstance[]>([]);
    const [template, setTemplate] = useState<TemplateInfo | null>(null);
    const [previews, setPreviews] = useState<Record<string, { colors: Array<{ hex?: string; label?: string }> }>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (templateId) {
            loadResults();
        }
    }, [templateId]);

    const loadResults = async () => {
        try {
            const [instancesRes, templateRes] = await Promise.all([
                api.get(`/templates/${templateId}/instances`),
                api.get(`/templates/${templateId}/public`)
            ]);
            setInstances(instancesRes.data);
            setTemplate(templateRes.data);

            // fetch full template structure for color previews
            try {
                const fullRes = await api.get(`/templates/${templateId}/full`);
                const structure = fullRes.data as any;

                // fetch each instance details to extract color responses
                const previewsMap: Record<string, { colors: Array<{ hex?: string; label?: string }> }> = {};
                await Promise.all(instancesRes.data.map(async (inst: any) => {
                    try {
                        const instRes = await api.get(`/brief-instances/${inst.id}`);
                        const instance = instRes.data;
                        const colors: Array<{ hex?: string; label?: string }> = [];

                        const blocks = structure.blocks || [];
                        const allQuestions: any[] = blocks.flatMap((b: any) => b.questions || []);

                        allQuestions.filter(q => q.type === 'color').forEach(q => {
                            const resp = (instance.responses || []).find((r: any) => r.questionId === q.id);
                            if (!resp || resp.value == null) return;
                            const selections = Array.isArray(resp.value) ? resp.value : [resp.value];
                            selections.forEach((sel: any) => {
                                let opt = (q.colorOptions || []).find((o: any) => o.id === sel || o.hex === sel || o.value === sel || (o.hex || '').toLowerCase() === String(sel).toLowerCase());
                                const hex = opt?.hex || (typeof sel === 'string' && /^#/.test(sel) ? sel : undefined);
                                const label = opt?.label || opt?.name || (typeof sel === 'string' && !hex ? sel : undefined);
                                colors.push({ hex, label });
                            });
                        });

                        previewsMap[inst.id] = { colors: colors.slice(0, 6) };
                    } catch (e) {
                        // ignore per-instance failures
                    }
                }));

                setPreviews(previewsMap);
            } catch (e) {
                // ignore if full template fetch fails
            }
        } catch (error) {
            console.error('Error loading results:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Link to="/templates" className="hover:text-primary transition-colors">Templates</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span>Resultados</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {template?.name || 'Carregando...'}
                </h1>
                <p className="text-muted-foreground mt-1">
                    Visualize e gerencie as respostas enviadas pelos seus clientes.
                </p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                </div>
            ) : instances.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent className="flex flex-col items-center">
                        <div className="bg-muted p-4 rounded-full mb-4">
                            <Clock className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">Ainda não há respostas</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-6">
                            Assim que um cliente começar a preencher, o briefing aparecerá aqui.
                        </p>
                        <Button asChild variant="outline">
                            <Link to="/templates">Voltar para Templates</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {instances.map((instance) => (
                        <Card key={instance.id} className="hover:shadow-md transition-shadow group overflow-hidden border-slate-200">
                            <Link to={`/briefings/${instance.id}`} className="block">
                                <CardContent className="p-0">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
                                        <div className="flex items-start gap-4 h-full">
                                            <div className="bg-primary/10 p-3 rounded-full hidden sm:block">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                                    {instance.user?.name || 'Cliente sem nome'}
                                                    <Badge variant={instance.status === 'completed' ? 'default' : 'secondary'} className="ml-2 py-0 h-5">
                                                        {instance.status === 'completed' ? (
                                                            <>
                                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                Concluído
                                                            </>
                                                        ) : 'Em andamento'}
                                                    </Badge>
                                                </h3>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                    <span className="flex items-center">
                                                        <Mail className="mr-1.5 h-3.5 w-3.5" />
                                                        {instance.user?.email}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                                        {new Date(instance.updatedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {previews[instance.id]?.colors?.length ? (
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {previews[instance.id].colors.map((c, i) => (
                                                            <div key={i} className="inline-flex items-center">
                                                                <ColorChip hex={c.hex} label={undefined} size={14} className="!gap-1" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0">
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-slate-500">Respostas</p>
                                                <p className="text-2xl font-bold text-slate-900">{instance._count.responses}</p>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                                                <ChevronRight className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
