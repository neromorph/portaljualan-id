export type ProfileUiStatus = 'draft' | 'processing' | 'needs_attention' | 'ready';
export type ProfileUiTone = 'neutral' | 'warning' | 'success' | 'danger';

export type ProfileUiState = {
	status: ProfileUiStatus;
	label: string;
	tone: ProfileUiTone;
	primaryActionLabel: string;
	primaryActionHref: string | null;
	helperText: string;
};

type ProfileLike = {
	id: string;
	status?: string | null;
	extraction_status?: string | null;
	readiness_score?: number | null;
	improvement_suggestions?: unknown[] | null;
};

export function getProfileUiState(profile: ProfileLike): ProfileUiState {
	if (profile.extraction_status === 'pending') {
		return {
			status: 'processing',
			label: 'Sedang diproses',
			tone: 'neutral',
			primaryActionLabel: 'Lihat progres',
			primaryActionHref: `/profile/${profile.id}`,
			helperText: 'Profil sedang disusun dari cerita usaha.'
		};
	}

	if (profile.status !== 'reviewed') {
		return {
			status: 'draft',
			label: 'Draft',
			tone: 'warning',
			primaryActionLabel: 'Periksa profil',
			primaryActionHref: `/profile/${profile.id}/edit`,
			helperText: 'Profil perlu diperiksa sebelum dibagikan.'
		};
	}

	if (profile.extraction_status === 'failed' || profile.readiness_score == null) {
		return {
			status: 'needs_attention',
			label: 'Perlu perhatian',
			tone: 'danger',
			primaryActionLabel: 'Lengkapi profil',
			primaryActionHref: `/profile/${profile.id}/edit`,
			helperText: 'Beberapa informasi belum lengkap atau perlu diperiksa.'
		};
	}

	return {
		status: 'ready',
		label: 'Siap ditinjau',
		tone: 'success',
		primaryActionLabel: profile.improvement_suggestions?.length ? 'Lihat rekomendasi' : 'Lihat profil',
		primaryActionHref: `/profile/${profile.id}`,
		helperText: 'Profil siap dibaca dan ditindaklanjuti.'
	};
}
