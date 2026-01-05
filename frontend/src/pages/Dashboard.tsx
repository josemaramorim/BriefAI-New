import * as React from "react"
import { useTranslation } from 'react-i18next';
import {
    FileText,
    CheckCircle2,
    Clock,
    PlusCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const { t } = useTranslation();

    const stats = [
        {
            title: t('dashboard.totalTemplates', 'Total de Templates'),
            value: '12',
            icon: FileText,
            color: 'text-blue-600',
            bg: 'bg-blue-100'
        },
        {
            title: t('dashboard.publishedTemplates', 'Publicados'),
            value: '8',
            icon: CheckCircle2,
            color: 'text-green-600',
            bg: 'bg-green-100'
        },
        {
            title: t('dashboard.draftTemplates', 'Rascunhos'),
            value: '4',
            icon: Clock,
            color: 'text-yellow-600',
            bg: 'bg-yellow-100'
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t('nav.dashboard', 'Dashboard')}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {t('dashboard.welcome', 'Bem-vindo ao seu painel de templates.')}
                    </p>
                </div>
                <Button asChild>
                    <Link to="/templates/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t('templates.newTemplate', 'Novo Template')}
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`${stat.bg} p-2 rounded-full`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            {/* <p className="text-xs text-muted-foreground">
                                +2 desde o último mês
                            </p> */}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>{t('dashboard.recentActivity', 'Atividade Recente')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            Template "Briefing Campanha Q4" atualizado
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Há 2 horas
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>{t('dashboard.quickActions', 'Ações Rápidas')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link to="/templates">
                                <FileText className="mr-2 h-4 w-4" />
                                Ver todos os templates
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link to="/templates/new">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Criar novo template
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
