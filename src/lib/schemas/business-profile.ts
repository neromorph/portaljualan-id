export type BusinessProfileInput = {
	businessName?: string;
	businessType?: string;
	location?: string;
	startedYear?: number;
	productsOrServices?: string;
	monthlyRevenueEstimate?: string;
	employeeCount?: number;
	salesChannels?: string[];
	businessNeeds?: string;
	growthTarget?: string;
	mainChallenges?: string;
	strengths?: string[];
	risks?: string[];
	evidenceSummary?: string;
};

export type ReadinessLevel = 'awal' | 'berkembang' | 'siap_kolaborasi';

export type ReadinessBreakdown = {
	profileCompleteness: number;
	needClarity: number;
	targetClarity: number;
	activityEvidence: number;
	collaborationReadiness: number;
};

export type ReadinessResult = {
	score: number;
	level: ReadinessLevel;
	breakdown: ReadinessBreakdown;
};
