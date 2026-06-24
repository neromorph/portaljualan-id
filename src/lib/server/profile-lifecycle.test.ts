import assert from 'node:assert/strict';
import test from 'node:test';
import { canApplyExtraction, profileLifecycleView } from './profile-lifecycle';

test('profile lifecycle', () => {
	assert.equal(canApplyExtraction({ status: 'reviewed' }), false);
	assert.equal(canApplyExtraction({ status: 'draft' }), true);
	assert.deepEqual(
		profileLifecycleView({
			status: 'draft',
			extraction_status: 'failed',
			extraction_error: 'Ekstraksi gagal.'
		}),
		{
			isDraft: true,
			isReviewed: false,
			extractionPending: false,
			extractionFailed: true,
			extractionSucceeded: false,
			extractionError: 'Ekstraksi gagal.',
			canRetryExtraction: true,
			retryAt: null
		}
	);
});
