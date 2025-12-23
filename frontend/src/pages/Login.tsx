import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from '../components/LanguageSelector';
import { ModeToggle } from '../components/mode-toggle';
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Loader2 } from "lucide-react"

export default function Login() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/templates');
        } catch (err) {
            setError(t('auth.invalidCredentials'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-background">
            {/* Left Side - Hero/Branding */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 relative overflow-hidden text-white p-12 flex-col justify-between dark:from-indigo-950 dark:via-indigo-900 dark:to-purple-950">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 grayscale mix-blend-multiply"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <div className="relative z-10 animate-fade-in-up">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl mb-6">
                        {t('app.title')}
                    </h1>
                    <p className="max-w-xl text-lg text-indigo-100 leading-relaxed dark:text-indigo-200">
                        Revolucione a forma como você cria e gerencia briefings.
                        Automação inteligente e templates flexíveis para impulsionar seus projetos.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-indigo-200 font-medium">
                    &copy; 2025 BriefAI. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative bg-background">
                <div className="absolute top-6 right-6 flex items-center space-x-2">
                    <ModeToggle />
                    <LanguageSelector />
                </div>

                <div className="max-w-md w-full space-y-10">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-display">
                            {t('auth.welcome')}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t('auth.loginTitle')}
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-lg bg-destructive/15 p-4 border-l-4 border-destructive flex items-center animate-shake">
                                <svg className="h-5 w-5 text-destructive mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm font-medium text-destructive">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('auth.email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nome@empresa.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">{t('auth.password')}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full"
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t('auth.loggingIn')}
                                    </>
                                ) : (
                                    t('auth.login')
                                )}
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
