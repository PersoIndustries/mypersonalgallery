import type { DevTask } from './dev-tasks';

/** Export only selected records, retaining current edits and caller order. */
export function selectedDevTasks(tasks: DevTask[], ids: ReadonlySet<string>) {
  return tasks.filter(task => ids.has(task.id));
}

export function formatDevTaskBrief(tasks: DevTask[], context = '') {
  if (tasks.length === 0) return '';
  return [
    '# MyOwnMuseum — tareas a realizar',
    'Implementa las siguientes tareas. Revisa primero el estado actual; no repitas trabajo ya realizado. Conserva los IDs y actualiza su estado en DEV solo después de verificar el resultado.',
    'Restricciones del proyecto: Supabase externo; administración solo para admins verificados en el servidor; contenido de usuarios sin traducir; interfaz en español e inglés; Stripe y pagos todavía desactivados. No incluyas secretos ni datos personales en informes.',
    ...(context.trim() ? ['## Contexto adicional', context.trim()] : []),
    ...tasks.map(task => [
      `## ${task.id} — ${task.title}`,
      `Área: ${task.area} | Prioridad: ${task.priority} | Estado: ${task.status}`,
      `Impacto: ${task.impact}/5 | Esfuerzo: ${task.effort}/5 | Orden: ${task.rank} | Creada: ${task.createdAt}`,
      task.description.trim() || 'Descripción pendiente: determina el alcance con el usuario antes de implementar cambios ambiguos.',
    ].join('\n')),
  ].join('\n\n');
}