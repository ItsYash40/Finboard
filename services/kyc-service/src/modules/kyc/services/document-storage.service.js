import path from "path";
import fs from "fs/promises";
import { buildDomainEvent, kafkaTopics } from "@finboard/contracts";
import { publishEvent } from "@finboard/kafka";
import { ensureBucket, getPresignedDownloadUrl, isStorageEnabled, uploadObject } from "@finboard/storage";

export async function initKycStorage(log) {
  if (!isStorageEnabled()) {
    return;
  }

  await ensureBucket(log);
}

async function persistUploadedFile(file, userId, type) {
  const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;

  if (isStorageEnabled()) {
    const storageKey = `kyc/${userId}/${type}/${filename}`;
    await uploadObject(storageKey, file.buffer, file.mimetype);
    const url = await getPresignedDownloadUrl(storageKey);
    return {
      path: storageKey,
      storageKey,
      url
    };
  }

  return {
    path: file.path,
    storageKey: path.basename(file.path),
    url: `/uploads/kyc/${path.basename(file.path)}`
  };
}

export async function buildKycDocument(file, type, processed, userId) {
  const stored = await persistUploadedFile(file, userId, type);
  return {
    type,
    originalName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    path: stored.path,
    storageKey: stored.storageKey,
    url: stored.url,
    ocrText: processed.ocrText,
    extracted: processed.extracted,
    extractionSource: processed.extractionSource
  };
}

export async function enrichDocumentUrls(documents) {
  if (!isStorageEnabled() || !documents?.length) {
    return documents;
  }

  return Promise.all(
    documents.map(async (document) => {
      if (!document.storageKey && !document.path?.startsWith("kyc/")) {
        return document;
      }

      const key = document.storageKey || document.path;
      const url = await getPresignedDownloadUrl(key);
      return url ? { ...document, url } : document;
    })
  );
}

export async function publishKycEvent(topic, application, action, details = {}, log) {
  return publishEvent(
    topic,
    buildDomainEvent({
      eventType: topic,
      action,
      userId: application.userId,
      resourceType: "kyc",
      resourceId: application._id,
      details: {
        status: application.status,
        ...details
      }
    }),
    log
  );
}

export async function readLocalFileForOcr(file) {
  if (file.buffer) {
    return file.buffer;
  }

  return fs.readFile(file.path);
}
