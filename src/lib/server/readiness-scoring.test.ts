import assert from 'node:assert/strict';
import test from 'node:test';
import { scoreReadiness } from './readiness-scoring';

test('empty profile scores awal', () => {
	const result = scoreReadiness({});
	assert.equal(result.score, 0);
	assert.equal(result.level, 'awal');
	assert.equal(result.breakdown.profileCompleteness, 0);
});

test('minimal name only scores awal', () => {
	const result = scoreReadiness({ businessName: 'Warung Bu Ani' });
	assert.equal(result.level, 'awal');
	assert.ok(result.score < 40);
});

test('fully populated profile scores 100', () => {
	const result = scoreReadiness({
		businessName: 'Dapur Frozen Bu Ani',
		businessType: 'Frozen food',
		location: 'Bandung',
		startedYear: 2022,
		productsOrServices: 'Dimsum, nugget ayam, dan bakso frozen',
		monthlyRevenueEstimate: 'Sekitar 15 juta per bulan',
		employeeCount: 3,
		salesChannels: ['WhatsApp', 'Instagram', 'Reseller'],
		businessNeeds: 'Butuh supplier kemasan dan reseller area Bandung',
		growthTarget: 'Menambah 10 reseller dalam 6 bulan',
		evidenceSummary: 'Ada foto produk dan katalog Instagram',
		strengths: ['Pelanggan repeat order', 'Produk tahan lama'],
		risks: ['Kapasitas freezer terbatas']
	});
	assert.equal(result.score, 100);
	assert.equal(result.level, 'siap_kolaborasi');
});

test('partial profile scores berkembang', () => {
	const result = scoreReadiness({
		businessName: 'Laundry Pak Budi',
		businessType: 'Laundry',
		location: 'Surabaya',
		startedYear: 2023,
		productsOrServices: 'Laundry kiloan dan satuan',
		businessNeeds: 'Butuh lebih banyak pelanggan'
		// missing: revenue, employees, channels, target, evidence, strengths, risks
	});
	assert.equal(result.level, 'berkembang');
	assert.ok(result.score >= 40);
	assert.ok(result.score < 75);
});

test('only needs and target gives partial score', () => {
	const result = scoreReadiness({
		businessNeeds: 'Butuh tambahan modal untuk mesin baru',
		growthTarget: 'Naikkan omzet 30% tahun ini'
	});
	// 0 from completeness, 20 need, 15 target, 0 activity, 10 collaboration (needs+target but no strengths/risks)
	assert.equal(result.breakdown.needClarity, 20);
	assert.equal(result.breakdown.targetClarity, 15);
	assert.equal(result.breakdown.collaborationReadiness, 10);
});
