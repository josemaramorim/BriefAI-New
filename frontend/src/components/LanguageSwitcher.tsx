import * as React from "react";
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const languages = [
        { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
    ];

    const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-slate-500 hover:text-primary transition-colors">
                    <Languages className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">{currentLanguage.name}</span>
                    <span className="sm:hidden font-medium">{currentLanguage.code.toUpperCase()}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => i18n.changeLanguage(lang.code)}
                    >
                        <span>{lang.name}</span>
                        <span className="text-lg">{lang.flag}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
