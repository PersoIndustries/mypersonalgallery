import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDevTaskBrief, selectedDevTasks } from '../dev-task-export';
import { SEED_TASKS } from '../dev-tasks';

test('multi-task export includes only selected IDs and current complete records', () => {
  const rows = SEED_TASKS.map(task => ({ ...task }));
  rows[0] = { ...rows[0], description: 'Current edited requirements' };
  const chosen = selectedDevTasks(rows, new Set(['t1', 't3', 'deleted-id']));
  assert.deepEqual(chosen.map(task => task.id), ['t1', 't3']);
  assert.equal(chosen[0].description, 'Current edited requirements');
  const brief = formatDevTaskBrief(chosen, 'Reproduce on mobile');
  for (const task of chosen) {
    assert.ok(brief.includes(task.id));
    assert.ok(brief.includes(task.title));
    assert.ok(brief.includes(task.description));
    assert.ok(brief.includes(task.createdAt));
  }
  assert.ok(brief.includes('Reproduce on mobile'));
  assert.ok(!brief.includes('## t2 —'));
});

test('export does not create a request without selected tasks', () => {
  assert.equal(formatDevTaskBrief([], 'Extra context'), '');
});