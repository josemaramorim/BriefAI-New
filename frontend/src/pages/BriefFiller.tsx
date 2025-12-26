import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Loader2, ArrowRight, CheckCircle2, FileText, Sparkles } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import api from '../lib/api';
import QuestionRenderer from '../components/QuestionRenderer';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

type Step = 'welcome' | 'filling' | 'completed';

interface Question {
    id: string;
    text: string;
    type: string;
    required: boolean;
    placeholder?: string;
    options?: any;
}

interface Block {
    id: string;
    title: string;
    description?: string;
    order: number;
    questions: Question[];
}

interface Rule {
    id: string;
    expression: string; // JSON string
    action: string;     // JSON string
}

interface TemplateFull {
    id: string;
    name: string;
    description?: string;
    blocks: Block[];
    rules: Rule[];
}

export default function BriefFiller() {
    const { t } = useTranslation();
    const { id: templateId } = useParams();
    const { toast } = useToast();
    const [step, setStep] = useState<Step>('welcome');
    const [loading, setLoading] = useState(false);
    const [templateInfo, setTemplateInfo] = useState<TemplateFull | null>(null);
    const [instanceId, setInstanceId] = useState<string | null>(null);

    // Form fields for identification
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    // Filling state
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
    const [visibleBlockIds, setVisibleBlockIds] = useState<string[]>([]);

    useEffect(() => {
        if (templateId) {
            loadBasicTemplateInfo();
            checkExistingSession();
        }
    }, [templateId]);

    const checkExistingSession = async () => {
        const token = localStorage.getItem('respondent_token');
        const savedInstanceId = localStorage.getItem('respondent_instance_id');

        if (token && savedInstanceId) {
            try {
                // We'll need to make sure the token matches the current template
                // For now, let's try to load the instance
                const response = await api.get(`/brief-instances/${savedInstanceId}`);

                // If it's for a different template, ignore
                if (response.data.templateId !== templateId) {
                    return;
                }

                if (response.data.user) {
                    setName(response.data.user.name || '');
                    setEmail(response.data.user.email || '');
                }

                setInstanceId(savedInstanceId);
                console.log('Brief instance loaded:', savedInstanceId);

                // Map responses
                if (response.data.responses) {
                    const mapped = response.data.responses.reduce((acc: any, r: any) => {
                        acc[r.questionId] = r.value;
                        return acc;
                    }, {});
                    console.log('Restored responses:', mapped);
                    setResponses(mapped);
                }

                // Restore metadata
                if (response.data.metadata?.lastBlockIndex !== undefined) {
                    setCurrentBlockIndex(response.data.metadata.lastBlockIndex);
                }

                await loadFullTemplate();
                setStep('filling');
            } catch (error) {
                console.error('Error resuming session:', error);
                // If token invalid, clear it
                localStorage.removeItem('respondent_token');
                localStorage.removeItem('respondent_instance_id');
            }
        }
    };

    // Re-evaluate rules whenever responses change
    useEffect(() => {
        if (templateInfo) {
            evaluateRules();
        }
    }, [responses, templateInfo]);

    const loadBasicTemplateInfo = async () => {
        setLoading(true);
        try {
            // We'll need a public route for this or allow anonymous access to basic info
            const response = await api.get(`/templates/${templateId}/public`);
            setTemplateInfo(response.data);
        } catch (error) {
            console.error('Error loading template info:', error);
            // Fallback for demo if route doesn't exist yet
            setTemplateInfo({
                id: templateId || '',
                name: 'Briefing de Projeto',
                description: 'Este briefing nos ajudará a entender suas necessidades e desejos para o projeto.',
                blocks: [],
                rules: []
            });
        } finally {
            setLoading(false);
        }
    };

    const loadFullTemplate = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/templates/${templateId}/full`);
            setTemplateInfo(response.data);
            // Initial visibility calculation happens after template is loaded via useEffect
        } catch (error) {
            console.error('Error loading full template:', error);
        } finally {
            setLoading(false);
        }
    };

    const evaluateRules = () => {
        if (!templateInfo || !templateInfo.blocks) return;

        // Start with all non-conditional blocks (logic can vary, but let's assume all are visible unless hidden)
        // Or better: Process rules to hide/show
        const activeBlockIds = new Set(templateInfo.blocks.map(b => b.id));

        (templateInfo.rules || []).forEach(rule => {
            try {
                const condition = JSON.parse(rule.expression);
                const action = JSON.parse(rule.action);

                const answer = responses[condition.questionId];
                let isMatch = false;

                if (condition.operator === '=') isMatch = answer === condition.value;
                if (condition.operator === '!=') isMatch = answer !== condition.value;
                if (condition.operator === 'contains') isMatch = Array.isArray(answer) && answer.includes(condition.value);

                if (action.type === 'activate_block') {
                    // Logic: By default blocks could be hidden if they have a rule? 
                    // Let's keep it simple for MVP: If it has an activate rule and it's NOT met, HIDE it.
                    if (!isMatch) {
                        activeBlockIds.delete(action.targetId || action.blockId);
                    }
                }
            } catch (e) {
                console.error('Error evaluating rule:', e);
            }
        });

        const sortedIds = templateInfo.blocks
            .filter(b => activeBlockIds.has(b.id))
            .sort((a, b) => a.order - b.order)
            .map(b => b.id);

        setVisibleBlockIds(sortedIds);
    };

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) {
            toast({
                title: t('common.error'),
                description: 'Por favor, preencha seu nome e email para continuar.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            // This will create the respondent user and the brief instance
            const response = await api.post('/brief-instances/start', {
                templateId,
                name,
                email
            });

            // Store the session token (different from admin token)
            localStorage.setItem('respondent_token', response.data.token);
            localStorage.setItem('respondent_instance_id', response.data.instanceId);
            setInstanceId(response.data.instanceId);

            // Map existing responses if any
            if (response.data.responses && response.data.responses.length > 0) {
                const mappedResponses = response.data.responses.reduce((acc: any, r: any) => {
                    acc[r.questionId] = r.value;
                    return acc;
                }, {});
                setResponses(mappedResponses);
            }

            // Restore progress from metadata
            if (response.data.metadata?.lastBlockIndex !== undefined) {
                setCurrentBlockIndex(response.data.metadata.lastBlockIndex);
            }

            await loadFullTemplate();
            setStep('filling');
        } catch (error: any) {
            console.error('Error starting briefing:', error);
            toast({
                title: t('common.error'),
                description: 'Não foi possível iniciar o briefing. Tente novamente.',
                variant: 'destructive',
            });
            // For now, let's just proceed for UI testing
            // await loadFullTemplate(); setStep('filling');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId: string, value: any) => {
        setResponses(prev => ({ ...prev, [questionId]: value }));
        // Save to backend (debounce or on-change)
        saveResponse(questionId, value);
    };

    const saveResponse = async (questionId: string, value: any) => {
        if (!instanceId) return;
        try {
            await api.post(`/brief-instances/${instanceId}/responses`, {
                responses: [{ questionId, value }]
            });
        } catch (error) {
            console.error('Error saving response:', error);
        }
    };

    const saveMetadata = async (newIndex: number) => {
        if (!instanceId) return;
        try {
            await api.post(`/brief-instances/${instanceId}/metadata`, {
                metadata: { lastBlockIndex: newIndex }
            });
        } catch (error) {
            console.error('Error saving metadata:', error);
        }
    };

    const currentBlock = templateInfo?.blocks?.find(b => b.id === visibleBlockIds[currentBlockIndex]);
    const progress = visibleBlockIds.length > 0 ? ((currentBlockIndex + 1) / visibleBlockIds.length) * 100 : 0;

    if (step === 'welcome') {
        return (
            <div className="min-h-screen bg-[slate-50] flex items-center justify-center p-4 sm:p-8 overflow-hidden relative">
                <div className="absolute top-4 right-4 z-20">
                    <LanguageSwitcher />
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />

                <Card className="max-w-xl w-full border-none shadow-2xl bg-white/80 backdrop-blur-xl animate-in fade-in zoom-in duration-700">
                    <CardHeader className="text-center space-y-4 pt-10 pb-6 border-b border-slate-100">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
                            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                        </div>
                        <div>
                            <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                                {templateInfo?.name || t('filler.welcome.title')}
                            </CardTitle>
                            <CardDescription className="text-base mt-3 max-w-sm mx-auto leading-relaxed">
                                {templateInfo?.description || t('filler.welcome.description')}
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-8 p-8 sm:p-12">
                        <form onSubmit={handleStart} className="space-y-6">
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="customer-name" className="text-sm font-medium text-slate-700 ml-1">
                                        {t('filler.welcome.nameLabel')}
                                    </Label>
                                    <Input
                                        id="customer-name"
                                        placeholder={t('filler.welcome.namePlaceholder')}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-12 bg-white border-slate-200 focus:border-primary focus:ring-primary/20 transition-all text-lg rounded-xl"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer-email" className="text-sm font-medium text-slate-700 ml-1">
                                        {t('filler.welcome.emailLabel')}
                                    </Label>
                                    <Input
                                        id="customer-email"
                                        type="email"
                                        placeholder={t('filler.welcome.emailPlaceholder')}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 bg-white border-slate-200 focus:border-primary focus:ring-primary/20 transition-all text-lg rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 text-lg font-semibold group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl shadow-lg shadow-primary/20"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        {t('filler.welcome.startButton')}
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100 text-slate-400">
                            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                {t('filler.welcome.safeAndPrivate')}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
                                <FileText className="w-4 h-4 text-primary" />
                                {templateInfo ? t('filler.welcome.personalized') : t('filler.welcome.processing')}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <p className="absolute bottom-8 left-0 right-0 text-center text-slate-400 text-sm font-medium">
                    Powered by <span className="text-primary font-bold">BriefAI</span>
                </p>
            </div>
        );
    }

    if (step === 'completed') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 relative">
                <div className="absolute top-4 right-4 z-20">
                    <LanguageSwitcher />
                </div>
                <Card className="max-w-md w-full text-center p-12 border-none shadow-2xl bg-white rounded-3xl animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('filler.completed.title')}</h2>
                    <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                        {t('filler.completed.description', { name })}
                    </p>
                    <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 text-xs font-medium uppercase tracking-widest">
                        {t('filler.completed.notified')}
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header filling state */}
            <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-900 leading-tight">
                            {templateInfo?.name}
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">{t('filler.header.respondingAs')} <span className="text-primary">{name}</span></p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />
                    <div className="hidden sm:flex flex-col items-end gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('filler.header.progress')}</span>
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-3xl mx-auto py-12 px-6">
                {currentBlock ? (
                    <div key={currentBlock.id} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="space-y-4 text-center mb-12">
                            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                {currentBlock.title}
                            </h2>
                            {currentBlock.description && (
                                <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
                                    {currentBlock.description}
                                </p>
                            )}
                            <div className="w-16 h-1 bg-primary/20 mx-auto rounded-full mt-6" />
                        </div>

                        <div className="space-y-12">
                            {currentBlock.questions.map((q) => (
                                <QuestionRenderer
                                    key={q.id}
                                    question={q}
                                    value={responses[q.id]}
                                    onChange={(value) => handleAnswerChange(q.id, value)}
                                />
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-12 border-t mt-16 pb-20">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    const prevIndex = Math.max(0, currentBlockIndex - 1);
                                    setCurrentBlockIndex(prevIndex);
                                    saveMetadata(prevIndex);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                disabled={currentBlockIndex === 0}
                                className="h-12 px-6 text-slate-500 hover:text-slate-900 rounded-xl font-semibold"
                            >
                                {t('filler.filling.back')}
                            </Button>

                            <Button
                                onClick={() => {
                                    if (currentBlockIndex < visibleBlockIds.length - 1) {
                                        const nextIndex = currentBlockIndex + 1;
                                        setCurrentBlockIndex(nextIndex);
                                        saveMetadata(nextIndex);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    } else {
                                        setStep('completed');
                                    }
                                }}
                                className="h-14 px-10 text-lg font-bold rounded-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                            >
                                {currentBlockIndex < visibleBlockIds.length - 1 ? (
                                    <>
                                        {t('filler.filling.continue')}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                ) : (
                                    t('filler.filling.finish')
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 space-y-6">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                        <p className="text-slate-500 font-medium">{t('filler.filling.preparing')}</p>
                    </div>
                )}
            </main>

            <footer className="p-8 text-center text-slate-300 text-[10px] font-bold uppercase tracking-widest mt-auto">
                {templateInfo?.name || 'BriefAI'} • © 2024 • {t('filler.footer.exclusive')}
            </footer>
        </div>
    );
}
