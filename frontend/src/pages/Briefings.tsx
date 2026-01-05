import * as React from "react";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { ChevronRight, User, Mail, Calendar, Inbox, Search } from 'lucide-react';
import { Input } from '../components/ui/input';

interface BriefInstance {
    id: string;
    status: string;
    updatedAt: string;
    template: {
        name: string;
    };
    user: {
        name: string;
        email: string;
    };
    _count: {
        responses: number;
    };
}

export default function Briefings() {
    const [instances, setInstances] = useState<BriefInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadBriefings();
    }, []);

    const loadBriefings = async () => {
        try {
            const response = await api.get('/brief-instances');
            setInstances(response.data);
        } catch (error) {
            console.error('Error loading all briefings:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredInstances = instances.filter(i =>
        i.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.template?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Briefings Recebidos</h1>
                    <p className="text-muted-foreground mt-1">
                        Acompanhe todas as respostas e o progresso dos seus clientes.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por cliente ou template..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                </div>
            ) : filteredInstances.length === 0 ? (
                <Card className="text-center py-16">
                    <CardContent className="flex flex-col items-center">
                        <div className="bg-muted p-4 rounded-full mb-4">
                            <Inbox className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">
                            {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum briefing ainda'}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-6">
                            {searchTerm ? 'Tente buscar com outros termos.' : 'Compartilhe seus templates para começar a receber respostas.'}
                        </p>
                        {!searchTerm && (
                            <Button asChild>
                                <Link to="/templates">Ver Meus Templates</Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredInstances.map((instance) => (
                        <Card key={instance.id} className="hover:shadow-md transition-shadow group overflow-hidden border bg-card text-card-foreground">
                            <Link to={`/briefings/${instance.id}`} className="block">
                                <CardContent className="p-0">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-primary/10 p-3 rounded-full hidden sm:block">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-bold text-lg">
                                                        {instance.user?.name || 'Cliente sem nome'}
                                                    </h3>
                                                    <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-5 bg-muted text-muted-foreground">
                                                        {instance.template?.name}
                                                    </Badge>
                                                    <Badge variant={instance.status === 'completed' ? 'default' : 'secondary'} className="py-0 h-5">
                                                        {instance.status === 'completed' ? 'Concluído' : 'Em andamento'}
                                                    </Badge>
                                                </div>
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
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0">
                                            <div className="text-right text-foreground">
                                                <p className="text-sm font-medium text-muted-foreground">Respostas</p>
                                                <p className="text-2xl font-bold text-foreground">{instance._count.responses}</p>
                                            </div>
                                            <div className="bg-muted p-2 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
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
