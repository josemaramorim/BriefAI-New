import React from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
    { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export default function LanguageSelector() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = React.useState(false);

    const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

    const changeLanguage = (langCode: string) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
                <span>{currentLanguage.flag}</span>
                <span>{currentLanguage.name}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                        <div className="py-1">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 ${lang.code === i18n.language ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                                        }`}
                                >
                                    <span>{lang.flag}</span>
                                    <span>{lang.name}</span>
                                    {lang.code === i18n.language && (
                                        <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
