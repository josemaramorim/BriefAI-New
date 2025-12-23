import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Mail, Calendar, FileText, ArrowLeft } from 'lucide-react';

interface Question {
    id: string;
    text: string;
    type: string;
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

    const renderValue = (value: any, type: string) => {
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

        return <span className="text-slate-700 whitespace-pre-wrap">{value.toString()}</span>;
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
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                            {data.user?.name}
                        </h1>
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {data.user?.email}</span>
                            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(data.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                        <FileText className="h-4 w-4" />
                        Imprimir / PDF
                    </Button>
                </div>
            </div>

            <div className="grid gap-8">
                {data.structure?.blocks.map((block) => (
                    <Card key={block.id} className="border-slate-200 overflow-hidden shadow-sm">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="text-xl font-bold text-slate-800">{block.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {block.questions.map((question) => {
                                    const response = data.responses.find(r => r.questionId === question.id);
                                    return (
                                        <div key={question.id} className="p-6 space-y-2 hover:bg-slate-50/50 transition-colors">
                                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                                {question.text}
                                            </p>
                                            <div className="text-lg">
                                                {renderValue(response?.value, question.type)}
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
