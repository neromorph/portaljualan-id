/**
 * Supabase Storage upload — server-side via AWS SDK S3 multipart upload.
 * Uses @aws-sdk/lib-storage Upload for better performance.
 */
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import {
	STORAGE_ENDPOINT,
	STORAGE_ACCESS_KEY,
	STORAGE_SECRET_KEY,
	STORAGE_REGION,
	STORAGE_BUCKET
} from '$env/static/private';

const BUCKET = STORAGE_BUCKET ?? 'evidence';

const s3 = new S3Client({
	region: STORAGE_REGION ?? 'ap-southeast-1',
	endpoint: STORAGE_ENDPOINT,
	forcePathStyle: true,
	credentials: {
		accessKeyId: STORAGE_ACCESS_KEY,
		secretAccessKey: STORAGE_SECRET_KEY
	}
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadEvidence(
	file: File,
	profileId: string
): Promise<{ url: string; path: string }> {
	if (!ALLOWED_TYPES.includes(file.type)) {
		throw new Error(`Tipe file tidak diizinkan. Gunakan JPG, PNG, atau WebP.`);
	}
	if (file.size > MAX_SIZE) {
		throw new Error('Ukuran file maksimal 5MB.');
	}

	const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
	const safeName = `${profileId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
	const buffer = Buffer.from(await file.arrayBuffer());

	const upload = new Upload({
		client: s3,
		params: {
			Bucket: BUCKET,
			Key: safeName,
			Body: buffer,
			ContentType: file.type,
			ACL: 'public-read'
		}
	});

	await upload.done();

	const url = `${STORAGE_ENDPOINT}/object/public/${BUCKET}/${safeName}`;
	return { url, path: safeName };
}

export async function deleteEvidence(path: string): Promise<void> {
	const command = new DeleteObjectCommand({ Bucket: BUCKET, Key: path });
	await s3.send(command);
}

export function getPublicUrl(path: string): string {
	return `${STORAGE_ENDPOINT}/object/public/${BUCKET}/${path}`;
}
