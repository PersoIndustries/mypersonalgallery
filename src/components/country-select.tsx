import { countryCodes } from '@/lib/platform-rules';
import {useI18n} from '@/lib/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
const names = new Intl.DisplayNames(['en'], { type: 'region' });
const countries = countryCodes.map(code => ({ code, name: names.of(code) || code })).sort((a,b) => a.name.localeCompare(b.name));
export function CountrySelect({value,onChange,id}:{value:string;onChange:(value:string)=>void;id:string}) {
 const {locale,t}=useI18n();const display=new Intl.DisplayNames([locale],{type:'region'});
 return <Select value={value} onValueChange={v => { if (v) onChange(v); }} required><SelectTrigger id={id} className="w-full"><SelectValue placeholder={t('Country of origin')}>{value ? display.of(value) || value : undefined}</SelectValue></SelectTrigger><SelectContent>{countries.map(c=><SelectItem key={c.code} value={c.code}>{display.of(c.code)||c.name}</SelectItem>)}</SelectContent></Select>;
}