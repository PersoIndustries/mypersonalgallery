import {test} from 'node:test';
import assert from 'node:assert/strict';
import {countrySchema,diagnosticSchema,diagnosticPath,requireAdminRole,PAYMENTS_ENABLED} from '../platform-rules';
import {translate} from '../i18n';
test('registration requires country of origin',()=>{assert.equal(countrySchema.safeParse('').success,false);assert.equal(countrySchema.safeParse('XX').success,false);assert.equal(countrySchema.parse('ES'),'ES');});
test('administration accepts only server-confirmed administrators',()=>{assert.throws(()=>requireAdminRole(false));assert.throws(()=>requireAdminRole('admin'));assert.doesNotThrow(()=>requireAdminRole(true));});
test('Stripe and charges remain disabled',()=>assert.equal(PAYMENTS_ENABLED,false));
test('error reports remove query tokens and do not accept raw messages',()=>{assert.equal(diagnosticPath('/auth?token=secret#recovery'),'/auth');assert.deepEqual(diagnosticSchema.parse({category:'operation',path:'/dashboard',fingerprint:'abcdef123456',message:'password'}),{category:'operation',path:'/dashboard',fingerprint:'abcdef123456'});});
test('Spanish default text leaves unknown user content unchanged',()=>{assert.equal(translate('es','Sign in'),'Iniciar sesión');assert.equal(translate('en','Sign in'),'Sign in');assert.equal(translate('es','My private collection title'),'My private collection title');});