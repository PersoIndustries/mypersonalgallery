import { createFileRoute, Link } from '@tanstack/react-router';
import { ScrollText } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const URL = 'https://curated-collection-museums.lovable.app/terms';
const UPDATED = '2026-11-19';
const CONTACT = 'support@layersuite.com';

type Section = { h: string; p?: string[]; li?: string[] };
const content: Record<'en' | 'es', { title: string; updated: string; intro: string; sections: Section[] }> = {
  en: {
    title: 'Terms of Use',
    updated: 'Last updated',
    intro: 'These terms set the rules for using Moon Collector, the platform for cataloguing and exhibiting personal collections.',
    sections: [
      {h: `1. Service provider`, li: [`Moon Collector is operated by Jardiper S.C., Carretera A131, km 1.8 S/N, 22520 Fraga (Huesca), Spain.`, `Contact: ${CONTACT}`]},
      {h: `2. Acceptance`, p: [`By creating an account or using Moon Collector you accept these terms. If you do not agree, please do not use the service.`]},
      {h: `3. Your account`, li: [`You must give accurate information and keep your password safe.`, `You are responsible for activity on your account.`, `You must be at least 14 years old, or have permission from a parent or guardian.`]},
      {h: `4. Your content`, p: [`Photos, descriptions and other content you upload remain yours. You grant Jardiper S.C. a free, non-exclusive licence to store, process and display it only as needed to run the service and according to the visibility you choose (private or public).`, `You confirm you own the content or have the right to publish it.`]},
      {h: `5. Acceptable use`, li: [`Do not upload illegal, offensive, violent or sexually explicit material.`, `Do not infringe copyright, trademarks or other rights of third parties.`, `Do not use the service for spam, fraud or to sell illegal or stolen goods.`, `Do not try to access other accounts or disrupt the service.`]},
      {h: `6. Moderation`, p: [`We may hide or remove content, make museums private, or suspend or delete accounts that break these terms, without prior notice when necessary.`]},
      {h: `7. Objects and collections`, p: [`Moon Collector is a tool for cataloguing and displaying personal collections. We do not verify or guarantee the authenticity, origin, ownership or value of any object shown, and we take no part in any deal between users.`]},
      {h: `8. Plans and changes to the service`, p: [`The service is currently offered free of charge. Paid plans may be introduced in the future; their price and conditions will be shown before you subscribe. We may change, suspend or discontinue features at any time.`]},
      {h: `9. Limitation of liability`, p: [`The service is provided “as is”. To the extent permitted by law, Jardiper S.C. is not liable for loss of data or content, indirect damages, or interruptions. Please keep your own copies of important photos and information.`]},
      {h: `10. Closing your account`, p: [`You can stop using the service at any time and ask us to delete your account by writing to ${CONTACT}.`]},
      {h: `11. Privacy`, p: [`How we handle personal data is explained in our Privacy Policy.`]},
      {h: `12. Applicable law`, p: [`These terms are governed by Spanish law. Any dispute will be handled by the courts of Spain, without prejudice to the rights consumers have under their own law.`]},
      {h: `13. Changes to these terms`, p: [`We may update these terms. The date of the latest version is shown at the top of this page; continuing to use the service means you accept the changes.`]},
    ],
  },
  es: {
    title: 'Términos de Uso',
    updated: 'Última actualización',
    intro: 'Estos términos establecen las normas de uso de Moon Collector, la plataforma para catalogar y exhibir colecciones personales.',
    sections: [
      {h: `1. Titular del servicio`, li: [`Moon Collector es un servicio de Jardiper S.C., Carretera A131, km 1.8 S/N, 22520 Fraga (Huesca), España.`, `Contacto: ${CONTACT}`]},
      {h: `2. Aceptación`, p: [`Al crear una cuenta o usar Moon Collector aceptas estos términos. Si no estás de acuerdo, no utilices el servicio.`]},
      {h: `3. Tu cuenta`, li: [`Debes facilitar información veraz y mantener tu contraseña a salvo.`, `Eres responsable de la actividad de tu cuenta.`, `Debes tener al menos 14 años o contar con permiso de tu madre, padre o tutor.`]},
      {h: `4. Tu contenido`, p: [`Las fotos, descripciones y demás contenido que subes siguen siendo tuyos. Concedes a Jardiper S.C. una licencia gratuita y no exclusiva para guardarlo, procesarlo y mostrarlo solo en la medida necesaria para prestar el servicio y según la visibilidad que elijas (privado o público).`, `Confirmas que eres titular del contenido o tienes derecho a publicarlo.`]},
      {h: `5. Uso aceptable`, li: [`No subas material ilegal, ofensivo, violento o sexualmente explícito.`, `No infrinjas derechos de autor, marcas u otros derechos de terceros.`, `No uses el servicio para spam, fraude o vender objetos ilegales o robados.`, `No intentes acceder a otras cuentas ni alterar el servicio.`]},
      {h: `6. Moderación`, p: [`Podemos ocultar o eliminar contenido, poner museos en privado, o suspender o borrar cuentas que incumplan estos términos, sin aviso previo cuando sea necesario.`]},
      {h: `7. Objetos y colecciones`, p: [`Moon Collector es una herramienta para catalogar y mostrar colecciones personales. No verificamos ni garantizamos la autenticidad, procedencia, propiedad ni valor de ningún objeto mostrado, y no participamos en ningún trato entre usuarios.`]},
      {h: `8. Planes y cambios en el servicio`, p: [`Actualmente el servicio es gratuito. En el futuro podrán existir planes de pago; su precio y condiciones se mostrarán antes de suscribirte. Podemos modificar, suspender o retirar funciones en cualquier momento.`]},
      {h: `9. Limitación de responsabilidad`, p: [`El servicio se ofrece “tal cual”. En la medida que permita la ley, Jardiper S.C. no responde de pérdidas de datos o contenido, daños indirectos ni interrupciones. Guarda tus propias copias de fotos e información importantes.`]},
      {h: `10. Cierre de la cuenta`, p: [`Puedes dejar de usar el servicio cuando quieras y pedirnos que borremos tu cuenta escribiendo a ${CONTACT}.`]},
      {h: `11. Privacidad`, p: [`Cómo tratamos los datos personales se explica en nuestra Política de Privacidad.`]},
      {h: `12. Legislación aplicable`, p: [`Estos términos se rigen por la ley española. Cualquier conflicto se resolverá ante los tribunales de España, sin perjuicio de los derechos que la normativa de consumo te reconozca.`]},
      {h: `13. Cambios en estos términos`, p: [`Podemos actualizar estos términos. La fecha de la última versión aparece al inicio de esta página; seguir usando el servicio supone aceptar los cambios.`]},
    ],
  },
};

export const Route = createFileRoute('/terms')({
  head: () => ({
    meta: [
      { title: 'Terms of Use — Moon Collector' },
      { name: 'description', content: 'Rules for using Moon Collector, operated by Jardiper S.C.: accounts, content, acceptable use and liability.' },
      { property: 'og:title', content: 'Terms of Use — Moon Collector' },
      { property: 'og:description', content: 'Accounts, your content, moderation and liability on Moon Collector.' },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: URL },
      { name: 'twitter:card', content: 'summary' },
    ],
    links: [{ rel: 'canonical', href: URL }],
  }),
  component: Terms,
});

function Terms() {
  const { locale } = useI18n();
  const c = content[locale === 'es' ? 'es' : 'en'];
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <ScrollText className="size-8 text-primary" />
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
      <div className="mt-10 border-t border-border pt-6"><Link to="/privacy" className="text-sm text-primary">{locale === 'es' ? 'Política de privacidad' : 'Privacy policy'}</Link></div>
    </article>
  );
}
