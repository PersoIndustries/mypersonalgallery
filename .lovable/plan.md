# Flujo de nuevo usuario y tutorial

## Situación actual
- Inicio: botón "Start your museum" lleva a /auth en modo registro.
- El registro pide 5 campos: nombre, usuario, país, email y contraseña. Luego hay que confirmar el email.
- El enlace de confirmación vuelve a la página de inicio, no al panel. El usuario tiene que buscar otra vez cómo entrar.
- El panel vacío solo muestra contadores a 0 y una frase. No hay tutorial ni pasos guiados.
- No se mide en qué paso abandona la gente.

## Flujo recomendado para conseguir más usuarios
```text
Inicio / museo público -> "Crea tu museo gratis"
  -> Registro corto (email, contraseña, nombre; país ya elegido según el navegador)
  -> Correo de confirmación -> vuelve directo a la bienvenida
  -> Bienvenida: "¿Qué coleccionas?" (elige categoría)
  -> Asistente: crear el primer museo (título + portada sugerida)
  -> Añadir el primer objeto (foto + nombre)
  -> Publicar y compartir el enlace
  -> Panel con lista de progreso hasta completar
```
Principios: pedir lo mínimo al principio, que la persona vea su museo lo antes posible y que compartirlo traiga nuevos usuarios.

## Cambios
1. **Registro más corto**
   - El nombre de usuario se sugiere solo a partir del nombre y se puede editar.
   - El país se rellena según el navegador. Sigue siendo obligatorio.
   - Mensaje claro tras registrarse: "Revisa tu correo", con opción de reenviar (con la espera de 60 s).
   - El enlace del correo lleva a la bienvenida, no a la página de inicio.
2. **Pantalla de bienvenida** (/dashboard/welcome): saluda por el nombre, pregunta qué colecciona y lleva al asistente. Se puede saltar.
3. **Asistente del primer museo** en 3 pasos: museo, primer objeto, publicar y compartir. Al terminar, copia el enlace público y ofrece compartirlo.
4. **Lista de progreso en el panel**: completar perfil, crear museo, 3 objetos, publicar, compartir. Muestra el porcentaje y desaparece al completarla.
5. **Tutorial guiado**: globos de ayuda paso a paso sobre el menú del panel, el editor de museo y el editor de objetos. Se abre la primera vez, se puede saltar y volver a abrir desde "Ayuda" o la página de FAQ.
6. **Captación desde museos públicos**: aviso discreto "Crea tu propio museo gratis" en las páginas de museos y objetos públicos, para quien no ha iniciado sesión.
7. **Embudo en el panel admin**: registros, confirmados, primer museo, primer objeto, publicado. Así se ve dónde se pierden usuarios.
8. **Notificación de bienvenida** enlazada al tutorial (hay que ajustar la que ya existe).
9. Todos los textos en español e inglés. Se añaden preguntas al FAQ y tareas DEV para lo que quede pendiente, por ejemplo correos de seguimiento al día 1 y día 3, que necesitan un dominio de correo.

## Detalles técnicos
- El progreso del onboarding y del tutorial (pasos vistos, saltado, terminado) se guarda en `profiles.preferences.onboarding` mediante el server function de perfil validado. No se guarda en el navegador.
- Los pasos de la lista de progreso se calculan con los datos reales (museos y objetos). Solo "compartido" y "tutorial visto" se guardan como estado.
- `emailRedirectTo` pasa a `${origin}/dashboard/welcome`. La URL tiene que estar permitida en Supabase → URL Configuration (lo configura el propietario).
- Tutorial con un componente propio de popover y anclas `data-tour`, sin librería nueva.
- Embudo: función SQL de solo lectura, ejecutada después de comprobar en el servidor que el usuario es admin, como `admin_platform_metrics`.
- Pruebas: sugerencia de usuario, cálculo de la lista de progreso y que el embudo esté restringido a admins.
