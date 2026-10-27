import {useContext,useEffect,useState,type ReactNode} from 'react';
import spanish from './locales/es.json';
import {I18nContext,type Locale,type Translator} from './i18n-context';
export function translate(locale:Locale,key:string,values:Record<string,string|number>={}){const trimmed=key.trim();const translated=(spanish as Record<string,string>)[trimmed];let text=locale==='es'&&translated?key.replace(trimmed,translated):key;for(const [name,value] of Object.entries(values))text=text.replaceAll('{'+name+'}',String(value));return text;}
export function I18nProvider({children}:{children:ReactNode}){const [locale,setLocale]=useState<Locale>('en');
 useEffect(()=>{const saved=localStorage.getItem('myownmuseum.language');setLocale(saved==='es'||saved==='en'?saved:navigator.language.startsWith('es')?'es':'en');},[]);
 const change=(value:Locale)=>{setLocale(value);localStorage.setItem('myownmuseum.language',value);};
 useEffect(()=>{document.documentElement.lang=locale;},[locale]);
 const t:Translator=(key,values)=>translate(locale,key,values);
 return <I18nContext.Provider value={{locale,setLocale:change,t}}>{children}</I18nContext.Provider>;
}
export function useI18n(){const context=useContext(I18nContext);return context??{locale:'en' as Locale,setLocale:(_locale:Locale)=>{},t:((key,values)=>translate('en',key,values)) as Translator};}