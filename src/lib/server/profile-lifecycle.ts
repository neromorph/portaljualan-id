export type ProfileStatus = 'draft' | 'reviewed';
export type ExtractionStatus = 'pending' | 'succeeded' | 'failed';

export function canApplyExtraction(profile: { status: ProfileStatus | null | undefined } | null): boolean {
	return profile?.status !== 'reviewed';
}

export function canRetryExtraction(profile: {
	status: ProfileStatus | null | undefined;
	extraction_status: ExtractionStatus | null | undefined;
	extraction_attempts?: number | null;
	last_extraction_attempt_at?: string | Date | null;
}, now = new Date()): boolean {
	return retryAvailableAt(profile, now) !== null && retryAvailableAt(profile, now)! <= now;
}

export function retryAvailableAt(profile: {
	status: ProfileStatus | null | undefined;
	extraction_status: ExtractionStatus | null | undefined;
	extraction_attempts?: number | null;
	last_extraction_attempt_at?: string | Date | null;
}, now = new Date()): Date | null {
	if (profile.status !== 'draft' || profile.extraction_status !== 'failed') return null;
	if ((profile.extraction_attempts ?? 0) >= 2) return null;
	if (!profile.last_extraction_attempt_at) return now;
	return new Date(new Date(profile.last_extraction_attempt_at).getTime() + 3 * 60 * 1000);
}

export function profileLifecycleView(profile: {
	status: ProfileStatus | null | undefined;
	extraction_status: ExtractionStatus | null | undefined;
	extraction_error?: string | null;
	extraction_attempts?: number | null;
	last_extraction_attempt_at?: string | Date | null;
}): {
	isDraft: boolean;
	isReviewed: boolean;
	extractionPending: boolean;
	extractionFailed: boolean;
	extractionSucceeded: boolean;
	extractionError: string | null;
	canRetryExtraction: boolean;
	retryAt: string | null;
} {
	const retryAt = retryAvailableAt(profile);
	const canRetry = canRetryExtraction(profile);
	return {
		isDraft: profile.status !== 'reviewed',
		isReviewed: profile.status === 'reviewed',
		extractionPending: profile.extraction_status === 'pending',
		extractionFailed: profile.extraction_status === 'failed',
		extractionSucceeded: profile.extraction_status === 'succeeded',
		extractionError: profile.extraction_error ?? null,
		canRetryExtraction: canRetry,
		retryAt: retryAt && !canRetry ? retryAt.toISOString() : null
	};
}
