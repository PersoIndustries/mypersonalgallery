import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSingleFlight, readRetryDelay, shouldRetryRead, withReadRetries } from '../async-actions';

test('an identical double submission runs only once', async () => {
  const singleFlight = createSingleFlight();
  let calls = 0;
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const action = () => singleFlight('create-object', async () => {
    calls++;
    await gate;
    return 'saved';
  });

  const first = action();
  const second = action();
  assert.strictEqual(first, second);
  release();
  assert.deepEqual(await Promise.all([first, second]), ['saved', 'saved']);
  assert.equal(calls, 1);
});

test('a completed action can be submitted again and failed actions are not retried automatically', async () => {
  const singleFlight = createSingleFlight();
  let calls = 0;
  await assert.rejects(() => singleFlight('save', async () => { calls++; throw new Error('offline'); }));
  await singleFlight('save', async () => { calls++; });
  assert.equal(calls, 2);
  assert.equal(shouldRetryRead(0), true);
  assert.equal(shouldRetryRead(1), true);
  assert.equal(shouldRetryRead(2), false);
});

test('read retries are bounded and distinct actions are not coalesced', async () => {
  const singleFlight = createSingleFlight();
  let calls = 0;
  await Promise.all([
    singleFlight('object-1', async () => { calls++; }),
    singleFlight('object-2', async () => { calls++; }),
  ]);
  assert.equal(calls, 2);
  assert.deepEqual([readRetryDelay(0), readRetryDelay(1), readRetryDelay(20)], [500, 1000, 3000]);
});

test('a failed read succeeds after two bounded retries with backoff', async () => {
  let calls = 0;
  const delays: number[] = [];
  const result = await withReadRetries(async () => {
    calls++;
    if (calls < 3) throw new Error('connection lost');
    return 'catalogue';
  }, async milliseconds => { delays.push(milliseconds); });
  assert.equal(result, 'catalogue');
  assert.equal(calls, 3);
  assert.deepEqual(delays, [500, 1000]);
});

test('a permanently failed read stops after three total attempts', async () => {
  let calls = 0;
  await assert.rejects(() => withReadRetries(async () => {
    calls++;
    throw new Error('still offline');
  }, async () => {}));
  assert.equal(calls, 3);
});
