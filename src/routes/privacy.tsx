import { createFileRoute, Link } from '@tanstack/react-router';
import { ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const URL = 'https://curated-collection-museums.lovable.app/privacy';
const UPDATED = '2026-11-19';
const CONTACT = 'support@layersuite.com';

type Section = { h: string; p?: string[]; li?: string[] };
const content: Record<'en' | 'es', { title: string; updated: string; intro: string; sections: Section[] }> = {
  en: {
    title: 'Privacy Policy & Legal Notice',
    updated: 'Last updated',
    intro: 'This policy explains what personal data Moon Collector collects, why, and what rights you have over it.',
    sections: [
      { h: '1. Who is responsible', li: ['Owner: Jardiper S.C.', 'Contact person: Carlos Peralta Sorolla', 'Address: Carretera A131, km 1.8 S/N, 22520 Fraga (Huesca), Spain', `Email: ${CONTACT}`] },
      { h: '2. Data we collect', li: ['Account data: name, username, email address, country and password (stored encrypted by our authentication provider).', 'If you sign in with Google: your name, email address and profile picture as shared by Google.', 'Profile data you choose to add: bio, location and avatar image.', 'Catalogue content you create: museums, objects, photos, descriptions, specifications, tags, links and collections.', 'Technical data: error reports and aggregated museum visit statistics.'] },
      { h: '3. Why we use it', li: ['To create and manage your account and let you sign in.', 'To store and display your museums and objects, publicly only when you choose to make them public.', 'To send essential account emails, such as password resets.', 'To keep the service secure, fix errors and understand overall usage.'], p: ['Legal basis: performance of the service you request (your account) and our legitimate interest in keeping the service secure and working.'] },
      { h: '4. Who receives your data', li: ['Supabase: database, authentication and image storage.', 'Hosting providers (Lovable, Netlify, Cloudflare): serving the website.', 'Google: only if you choose “Sign in with Google”; web fonts are also loaded from Google Fonts, which receives your IP address.', 'Lovable visitor analytics (see section 6).'], p: ['We do not sell your data or use it for advertising.'] },
      { h: '5. What is stored on your device', p: ['We store your sign-in session and your language and appearance preferences in your browser’s local storage so the site keeps you signed in and remembers your choices. We do not use advertising cookies.'] },
      { h: '6. Visitor analytics', p: ['Lovable’s analytics uses no cookies, stores nothing on your device, doesn’t keep IP addresses and doesn’t identify visitors. Lovable collects this data for us. Lovable’s privacy policy (https://lovable.dev/privacy) explains how it handles it.', 'It records the pages visited, where visitors came from, their country, browser, operating system and device type, how long they stay, how fast pages load, errors, and which buttons and links are clicked. Detailed data is kept for 90 days and daily summaries for a year.', 'This is recorded for every visitor, without cookies and without identifying anyone.'] },
      { h: '7. How long we keep data', p: ['We keep your account data and content while your account exists. When your account is deleted, your profile, museums, objects and photos are removed.'] },
      { h: '8. Your rights', li: ['Access, rectify or delete your data.', 'Restrict or object to processing.', 'Data portability.', 'Withdraw consent at any time.'], p: [`To exercise them, write to ${CONTACT}. You can also file a complaint with the Spanish Data Protection Agency (www.aepd.es).`] },
      { h: '9. Intellectual property', p: ['The Moon Collector name, design and code belong to Jardiper S.C. Content you upload remains yours; you grant us only the permission needed to store and display it as you choose.'] },
      { h: '10. Changes', p: ['We may update this policy. We will show the date of the latest version at the top of this page.'] },
    ],
  },
  es: {
    title: 'Política de Privacidad y Aviso Legal',
    updated: 'Última actualización',
    intro: 'Esta política explica qué datos personales recoge Moon Collector, para qué, y qué derechos tienes sobre ellos.',
    sections: [
      { h: '1. Responsable', li: ['Titular: Jardiper S.C.', 'Persona de contacto: Carlos Peralta Sorolla', 'Domicilio: Carretera A131, km 1.8 S/N, 22520 Fraga (Huesca), España', `Email: ${CONTACT}`] },
      { h: '2. Datos que recogemos', li: ['Datos de cuenta: nombre, nombre de usuario, email, país y contraseña (guardada cifrada por nuestro proveedor de autenticación).', 'Si entras con Google: tu nombre, email y foto de perfil tal como los comparte Google.', 'Datos de perfil que decidas añadir: biografía, ubicación e imagen de perfil.', 'Contenido que creas: museos, objetos, fotos, descripciones, especificaciones, etiquetas, enlaces y colecciones.', 'Datos técnicos: informes de errores y estadísticas agregadas de visitas a museos.'] },
      { h: '3. Para qué los usamos', li: ['Crear y gestionar tu cuenta y permitirte iniciar sesión.', 'Guardar y mostrar tus museos y objetos, de forma pública solo cuando tú lo eliges.', 'Enviar correos esenciales de la cuenta, como el restablecimiento de contraseña.', 'Mantener el servicio seguro, corregir errores y entender el uso general.'], p: ['Base legal: ejecución del servicio que solicitas (tu cuenta) y nuestro interés legítimo en mantener el servicio seguro y operativo.'] },
      { h: '4. Quién recibe tus datos', li: ['Supabase: base de datos, autenticación y almacenamiento de imágenes.', 'Proveedores de alojamiento (Lovable, Netlify, Cloudflare): para servir la web.', 'Google: solo si eliges “Entrar con Google”; además, las fuentes tipográficas se cargan desde Google Fonts, que recibe tu dirección IP.', 'Estadísticas de visitas de Lovable (ver apartado 6).'], p: ['No vendemos tus datos ni los usamos para publicidad.'] },
      { h: '5. Qué se guarda en tu dispositivo', p: ['Guardamos tu sesión y tus preferencias de idioma y apariencia en el almacenamiento local del navegador para mantenerte conectado y recordar tus elecciones. No usamos cookies publicitarias.'] },
      { h: '6. Estadísticas de visitas', p: ['Las estadísticas de Lovable no usan cookies, no guardan nada en tu dispositivo, no conservan direcciones IP y no identifican a los visitantes. Lovable recoge estos datos por nosotros. La política de privacidad de Lovable (https://lovable.dev/privacy) explica cómo los trata.', 'Registran las páginas visitadas, de dónde llegan los visitantes, su país, navegador, sistema operativo y tipo de dispositivo, cuánto tiempo se quedan, la velocidad de carga, los errores y en qué botones y enlaces se hace clic. Los datos detallados se guardan 90 días y los resúmenes diarios un año.', 'Esto se registra para todos los visitantes, sin cookies y sin identificar a nadie.'] },
      { h: '7. Cuánto tiempo los conservamos', p: ['Conservamos los datos de tu cuenta y tu contenido mientras la cuenta exista. Al eliminarla, se borran tu perfil, museos, objetos y fotos.'] },
      { h: '8. Tus derechos', li: ['Acceder, rectificar o suprimir tus datos.', 'Limitar u oponerte al tratamiento.', 'Portabilidad de los datos.', 'Retirar tu consentimiento en cualquier momento.'], p: [`Para ejercerlos, escribe a ${CONTACT}. También puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).`] },
      { h: '9. Propiedad intelectual', p: ['El nombre, diseño y código de Moon Collector pertenecen a Jardiper S.C. El contenido que subes sigue siendo tuyo; solo nos das el permiso necesario para guardarlo y mostrarlo como elijas.'] },
      { h: '10. Cambios', p: ['Podemos actualizar esta política. Mostraremos la fecha de la última versión al inicio de esta página.'] },
    ],
  },
};

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      { title: 'Privacy Policy & Legal Notice — Moon Collector' },
      { name: 'description', content: 'How Moon Collector, operated by Jardiper S.C., collects, uses and protects your personal data, and your rights.' },
      { property: 'og:title', content: 'Privacy Policy & Legal Notice — Moon Collector' },
      { property: 'og:description', content: 'Personal data, providers, analytics and your rights on Moon Collector.' },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: URL },
      { name: 'twitter:card', content: 'summary' },
    ],
    links: [{ rel: 'canonical', href: URL }],
  }),
  component: Privacy,
});

function Privacy() {
  const { locale } = useI18n();
  const c = content[locale === 'es' ? 'es' : 'en'];
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <ShieldCheck className="size-8 text-primary" />
      <h1 className="mt-4 font-display text-4xl">{c.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{c.updated}: {UPDATED}</p>
      <p className="mt-6 leading-relaxed text-muted-foreground">{c.intro}</p>
      {c.sections.map(s => (
        <section key={s.h} className="mt-8">
          <h2 className="font-display text-2xl">{s.h}</h2>
          {s.li && <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">{s.li.map(i => <li key={i}>{i}</li>)}</ul>}
          {s.p?.map(p => <p key={p} className="mt-3 leading-relaxed text-muted-foreground">{p}</p>)}
        </section>
      ))}
      <div className="mt-10 border-t border-border pt-6"><Link to="/help" className="text-sm text-primary">{locale === 'es' ? 'Ayuda y preguntas frecuentes' : 'Help and FAQs'}</Link></div>
    </article>
  );
}
