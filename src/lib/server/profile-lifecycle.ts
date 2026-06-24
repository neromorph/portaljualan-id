export type ProfileStatus = 'draft' | 'reviewed';
export type ExtractionStatus = 'pending' | 'succeeded' | 'failed';

export function profileLifecycleView(profile: {
	status?: ProfileStatus | null;
	extraction_status?: ExtractionStatus | null;
	extraction_error?: string | null;
}) {
	return {
		isDraft: profile.status !== 'reviewed',
		isReviewed: profile.status === 'reviewed',
		extractionPending: profile.extraction_status === 'pending',
		extractionFailed: profile.extraction_status === 'failed',
		extractionSucceeded: profile.extraction_status === 'succeeded',
		extractionError: profile.extraction_error ?? null
	};
}
