import assert from 'node:assert/strict';
import { profileLifecycleView } from './profile-lifecycle';

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
		extractionError: 'Ekstraksi gagal.'
	}
);
