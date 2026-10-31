import { test } from 'node:test';
import assert from 'node:assert/strict';
import { passwordStrength } from '../password-strength';

test('empty password has no strength', () => assert.equal(passwordStrength(''), 'none'));
test('short simple password is weak', () => { assert.equal(passwordStrength('abc'), 'weak'); assert.equal(passwordStrength('password'), 'weak'); });
test('longer mixed password is medium', () => assert.equal(passwordStrength('Password1'), 'medium'));
test('long varied password is strong', () => { assert.equal(passwordStrength('MyStr0ng!Pass'), 'strong'); assert.equal(passwordStrength('correct-Horse-Battery-9'), 'strong'); });
