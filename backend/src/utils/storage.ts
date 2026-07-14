import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "application/pdf",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function getR2Client(): S3Client {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 credentials not configured. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.",
    );
  }

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export interface UploadInitResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export async function initUpload(
  fileName: string,
  contentType: string,
  fileSize: number,
  purpose: string = "general",
): Promise<UploadInitResponse> {
  if (!ALLOWED_MIME_TYPES.includes(contentType)) {
    throw new Error(
      `File type "${contentType}" is not supported. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
    );
  }

  if (fileSize > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds the maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    );
  }

  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error("R2_BUCKET not configured.");

  const publicUrlBase = process.env.R2_PUBLIC_URL;
  if (!publicUrlBase) throw new Error("R2_PUBLIC_URL not configured.");

  const ext = fileName.split(".").pop() || "bin";
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `uploads/${purpose}/${crypto.randomUUID()}-${sanitizedName}`;

  const r2 = getR2Client();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });
  const publicUrl = `${publicUrlBase}/${key}`;

  return { uploadUrl, publicUrl, key };
}

export async function deleteFile(key: string): Promise<void> {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error("R2_BUCKET not configured.");

  const r2 = getR2Client();
  await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
