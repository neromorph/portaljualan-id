import type { BusinessProfileInput, ReadinessLevel, ReadinessResult } from '../schemas/business-profile';

function levelFor(score: number): ReadinessLevel {
	if (score >= 75) return 'siap_kolaborasi';
	if (score >= 40) return 'berkembang';
	return 'awal';
}

function hasText(value?: string): boolean {
	return Boolean(value?.trim());
}

function hasList<T>(value?: T[]): boolean {
	return Boolean(value?.length);
}

/**
 * Rule-based readiness scoring.
 * Gemini does NOT choose the score — it only explains the result.
 * Max 100 points across 5 dimensions.
 */
export function scoreReadiness(profile: BusinessProfileInput): ReadinessResult {
	// Profile completeness: 25 pts
	// Checks: name, type, location, year, product, revenue, employees, channels
	const profileCompletenessFields = [
		profile.businessName,
		profile.businessType,
		profile.location,
		profile.startedYear?.toString(),
		profile.productsOrServices,
		profile.monthlyRevenueEstimate,
		profile.employeeCount?.toString(),
		hasList(profile.salesChannels) ? 'yes' : undefined
	];
	const profileCompleteness = Math.round(
		(profileCompletenessFields.filter(hasText).length / profileCompletenessFields.length) * 25
	);

	// Need clarity: 20 pts
	// Clear statement of what the business needs
	const needClarity = hasText(profile.businessNeeds) ? 20 : 0;

	// Target clarity: 15 pts
	// Clear growth target or goal
	const targetClarity = hasText(profile.growthTarget) ? 15 : 0;

	// Activity evidence: 20 pts
	// Signs the business is actually running
	const activitySignals = [
		profile.startedYear?.toString(),
		profile.monthlyRevenueEstimate,
		hasList(profile.salesChannels) ? 'yes' : undefined,
		profile.evidenceSummary
	];
	const activityEvidence = Math.round(
		(activitySignals.filter(hasText).length / activitySignals.length) * 20
	);

	// Collaboration readiness: 20 pts
	// Understands own strengths, risks, needs, and goals
	const collaborationSignals = [
		profile.businessNeeds,
		profile.growthTarget,
		hasList(profile.strengths) ? 'yes' : undefined,
		hasList(profile.risks) ? 'yes' : undefined
	];
	const collaborationReadiness = Math.round(
		(collaborationSignals.filter(hasText).length / collaborationSignals.length) * 20
	);

	const score =
		profileCompleteness + needClarity + targetClarity + activityEvidence + collaborationReadiness;

	return {
		score,
		level: levelFor(score),
		breakdown: {
			profileCompleteness,
			needClarity,
			targetClarity,
			activityEvidence,
			collaborationReadiness
		}
	};
}
