'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

const translations = {
  en: {
    appName: 'AppGen',
    myApps: 'My Apps',
    newApp: 'New App',
    createApp: 'Create App',
    noApps: 'No apps yet',
    noAppsDesc: 'Create your first config-driven app',
    totalApps: 'Total Apps',
    components: 'Components',
    pages: 'Pages',
    logout: 'Logout',
    submit: 'Submit',
    save: 'Save',
    delete: 'Delete',
    cancel: 'Cancel',
    back: 'Back',
    importCSV: 'Import CSV',
    records: 'records',
    loading: 'Loading...',
    appCreated: 'apps created',
    open: 'Open',
    noRecords: 'No records yet',
  },
  hi: {
    appName: 'AppGen',
    myApps: 'मेरे ऐप्स',
    newApp: 'नया ऐप',
    createApp: 'ऐप बनाएं',
    noApps: 'अभी कोई ऐप नहीं',
    noAppsDesc: 'अपना पहला कॉन्फ़िग-संचालित ऐप बनाएं',
    totalApps: 'कुल ऐप्स',
    components: 'घटक',
    pages: 'पृष्ठ',
    logout: 'लॉग आउट',
    submit: 'जमा करें',
    save: 'सहेजें',
    delete: 'हटाएं',
    cancel: 'रद्द करें',
    back: 'वापस',
    importCSV: 'CSV आयात करें',
    records: 'रिकॉर्ड',
    loading: 'लोड हो रहा है...',
    appCreated: 'ऐप्स बनाए गए',
    open: 'खोलें',
    noRecords: 'अभी कोई रिकॉर्ड नहीं',
  },
  mr: {
    appName: 'AppGen',
    myApps: 'माझे अॅप्स',
    newApp: 'नवीन अॅप',
    createApp: 'अॅप तयार करा',
    noApps: 'अद्याप कोणतेही अॅप नाही',
    noAppsDesc: 'आपला पहिला कॉन्फिग-चालित अॅप तयार करा',
    totalApps: 'एकूण अॅप्स',
    components: 'घटक',
    pages: 'पृष्ठे',
    logout: 'लॉग आउट',
    submit: 'सबमिट करा',
    save: 'जतन करा',
    delete: 'हटवा',
    cancel: 'रद्द करा',
    back: 'मागे',
    importCSV: 'CSV आयात करा',
    records: 'नोंदी',
    loading: 'लोड होत आहे...',
    appCreated: 'अॅप्स तयार केले',
    open: 'उघडा',
    noRecords: 'अद्याप कोणत्याही नोंदी नाहीत',
  }
};

type Lang = 'en' | 'hi' | 'mr';
interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof translations.en;
}

const LangContext = createContext<LangCtx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext)!;