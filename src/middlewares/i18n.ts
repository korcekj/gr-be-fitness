import i18n from 'i18n';

i18n.configure({
  header: 'language',
  defaultLocale: 'en',
  locales: ['en', 'sk'],
  directory: __dirname + '/../../locales',
  objectNotation: true,
});

export const i18nHandler = i18n.init;
