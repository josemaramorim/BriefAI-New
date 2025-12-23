import i18n from 'i18n';
import path from 'path';

i18n.configure({
    locales: ['pt-BR', 'en', 'es'],
    defaultLocale: 'pt-BR',
    directory: path.join(__dirname, 'locales'),
    objectNotation: true,
    updateFiles: false,
    syncFiles: false,
});

export default i18n;
