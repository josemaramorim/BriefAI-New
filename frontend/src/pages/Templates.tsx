import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { PlusCircle, FileText, Calendar, ArrowRight, Link2, BarChart2, Info } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface Template {
    id: string;
    name: string;
    description?: string;
    published: boolean;
    allowDraftResponses?: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function Templates() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const response = await api.get('/templates');
            setTemplates(response.data);
        } catch (error) {
            console.error('Error loading templates:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('templates.title')}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t('templates.subtitle')}
                    </p>
                </div>
                {(user?.role === 'Admin' || user?.role === 'Editor') && (
                    <Button asChild>
                        <Link to="/templates/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {t('templates.newTemplate')}
                        </Link>
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardHeader className="space-y-2">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-3 w-1/4" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-full" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-4 w-1/3" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : templates.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent className="flex flex-col items-center">
                        <div className="bg-muted p-4 rounded-full mb-4">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">{t('templates.noTemplates')}</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-6">
                            {t('templates.noTemplatesDescription')}
                        </p>
                        {(user?.role === 'Admin' || user?.role === 'Editor') && (
                            <Button asChild>
                                <Link to="/templates/new">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    {t('templates.createTemplate')}
                                </Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                        <Card key={template.id} className="flex flex-col hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-xl font-bold truncate">
                                        {template.name}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={template.published ? "default" : "secondary"}>
                                            {template.published ? t('templates.published') : t('templates.draft')}
                                        </Badge>
                                        {template.allowDraftResponses && (
                                            <span title={t('templateBuilder.allowDraftResponsesDesc') || t('templates.allowDraftResponses') || 'Permite respostas em rascunho'} className="p-1 rounded">
                                                <Info className="h-4 w-4 text-muted-foreground" />
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <CardDescription className="flex items-center text-xs mt-1">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {new Date(template.createdAt).toLocaleDateString(
                                        t('app.locale') === 'pt-BR' ? 'pt-BR' : t('app.locale') === 'es' ? 'es-ES' : 'en-US'
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                {template.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {template.description}
                                    </p>
                                )}
                            </CardContent>
                            <CardFooter className="pt-4 border-t gap-2 flex-wrap sm:flex-nowrap">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 gap-2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const link = `${window.location.origin}/fill/${template.id}`;
                                        navigator.clipboard.writeText(link);
                                        toast({
                                            title: t('templates.linkCopied') || 'Link Copiado!',
                                            description: t('templates.linkCopiedDescription') || 'O link do briefing foi copiado para sua área de transferência.',
                                        });
                                    }}
                                >
                                    <Link2 className="h-4 w-4" />
                                    {t('templates.copyLink') || 'Copiar Link'}
                                </Button>
                                <Button variant="ghost" size="sm" className="flex-1 gap-2 border border-transparent hover:border-slate-200" asChild>
                                    <Link to={`/templates/${template.id}/results`}>
                                        <BarChart2 className="h-4 w-4" />
                                        {t('templates.viewResults') || 'Ver Resultados'}
                                    </Link>
                                </Button>
                                <Button variant="default" size="sm" className="flex-1 sm:flex-none" asChild>
                                    <Link to={`/templates/${template.id}`}>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
