import {createContext} from 'react';
export type Locale='en'|'es';
export type Translator=(key:string,values?:Record<string,string|number>)=>string;
export const I18nContext=createContext<{locale:Locale;setLocale:(locale:Locale)=>void;t:Translator}|null>(null);