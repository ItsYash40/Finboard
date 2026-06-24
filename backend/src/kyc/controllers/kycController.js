import path from "path";
import { DummyIdentity } from "../../models/DummyIdentity.js";
import { KycApplication } from "../../models/KycApplication.js";
import { User } from "../../models/User.js";
import { UserProfile } from "../../models/UserProfile.js";
import { audit } from "../services/auditService.js";
import { notifyUser } from "../services/appNotificationService.js";
import { processDocument } from "../services/ocrService.js";

function normalizeName(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function fileToDocument(file, type, processed) {
  return {
    type,
    originalName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    path: file.path,
    url: `/uploads/kyc/${path.basename(file.path)}`,
    ocrText: processed.ocrText,
    extracted: processed.extracted,
    extractionSource: processed.extractionSource
  };
}

function documentSummary(document) {
  return {
    type: document.type,
    originalName: document.originalName,
    url: document.url,
    extractionSource: document.extractionSource,
    extracted: document.extracted,
    match: document.match,
    ocrText: document.ocrText || "",
    ocrPreview: document.ocrText ? document.ocrText.slice(0, 500) : ""
  };
}

function applySeededDemoFallback(processed, type, identity) {
  if (!identity || processed.ocrText || processed.extracted?.panNumber || processed.extracted?.aadhaarNumber) {
    return processed;
  }

  const extracted =
    type === "pan"
      ? { name: identity.name, panNumber: identity.panNumber }
      : { name: identity.name, aadhaarNumber: identity.aadhaarNumber };

  return {
    ...processed,
    ocrText: `Demo OCR fallback from seeded identity dataset.\nName: ${identity.name}\n${type === "pan" ? `PAN: ${identity.panNumber}` : `Aadhaar: ${identity.aadhaarNumber}`}`,
    extracted,
    extractionSource: "seeded_demo_fallback"
  };
}

export async function submitKyc(req, res, next) {
  try {
    const panFile = req.files?.pan?.[0];
    const aadhaarFile = req.files?.aadhaar?.[0];

    if (!panFile || !aadhaarFile) {
      return res.status(400).json({ message: "PAN and Aadhaar files are required" });
    }

    const payload = {
      name: req.body.name,
      panNumber: req.body.panNumber?.toUpperCase(),
      aadhaarNumber: req.body.aadhaarNumber
    };

    const identity = await DummyIdentity.findOne({
      panNumber: payload.panNumber,
      aadhaarNumber: payload.aadhaarNumber
    });

    let [panProcessed, aadhaarProcessed] = await Promise.all([
      processDocument(panFile.path, "pan"),
      processDocument(aadhaarFile.path, "aadhaar")
    ]);

    panProcessed = applySeededDemoFallback(panProcessed, "pan", identity);
    aadhaarProcessed = applySeededDemoFallback(aadhaarProcessed, "aadhaar", identity);

    const panDoc = fileToDocument(panFile, "pan", panProcessed);
    const aadhaarDoc = fileToDocument(aadhaarFile, "aadhaar", aadhaarProcessed);

    panDoc.match = panDoc.extracted?.panNumber?.toUpperCase?.() === payload.panNumber;
    aadhaarDoc.match = String(aadhaarDoc.extracted?.aadhaarNumber || "") === payload.aadhaarNumber;

    const checks = {
      identityExists: Boolean(identity),
      nameMatchesDataset: Boolean(identity && normalizeName(identity.name) === normalizeName(payload.name)),
      panMatchesDataset: Boolean(identity && identity.panNumber === payload.panNumber),
      aadhaarMatchesDataset: Boolean(identity && identity.aadhaarNumber === payload.aadhaarNumber),
      panOcrMatches: panDoc.match,
      aadhaarOcrMatches: aadhaarDoc.match
    };

    const allPassed = checks.identityExists && checks.nameMatchesDataset && checks.panMatchesDataset && checks.aadhaarMatchesDataset;

    const application = await KycApplication.create({
      userId: req.user._id,
      ...payload,
      dummyIdentityId: identity?._id,
      status: allPassed ? "pending_admin_review" : "failed",
      failureReason: allPassed ? "" : "Name, PAN, or Aadhaar does not match the seeded identity database.",
      checks,
      documents: [panDoc, aadhaarDoc],
      submittedAt: new Date()
    });

    await UserProfile.findOneAndUpdate(
      { userId: req.user._id },
      { pan: payload.panNumber, kycStatus: allPassed ? "pending_review" : "rejected" },
      { upsert: true, new: true }
    );

    await notifyUser(
      req.user._id,
      allPassed ? "KYC Submitted" : "KYC Failed",
      allPassed ? "Your KYC passed automatic checks and is pending admin review." : "Your name, PAN, or Aadhaar did not match our dummy identity records.",
      "kyc"
    );
    await audit(req, "KYC_SUBMITTED", "kyc", application._id.toString(), { status: application.status, checks });

    return res.status(201).json({ application });
  } catch (error) {
    next(error);
  }
}

export async function getMyKyc(req, res, next) {
  try {
    const application = await KycApplication.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ application });
  } catch (error) {
    next(error);
  }
}

export async function listKycAdmin(req, res, next) {
  try {
    const applications = await KycApplication.find().sort({ createdAt: -1 }).limit(100).lean();
    const userIds = applications.map((app) => app.userId);
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = new Map(users.map((user) => [user._id.toString(), user]));
    res.json({
      applications: applications.map((app) => ({
        ...app,
        documents: app.documents?.map(documentSummary) || [],
        user: userMap.get(app.userId.toString())
      }))
    });
  } catch (error) {
    next(error);
  }
}

export async function getKycAdmin(req, res, next) {
  try {
    const application = await KycApplication.findById(req.params.id).lean();
    if (!application) {
      return res.status(404).json({ message: "KYC application not found" });
    }
    const user = await User.findById(application.userId).lean();
    const identity = application.dummyIdentityId ? await DummyIdentity.findById(application.dummyIdentityId).lean() : null;
    const adminReview = {
      entered: {
        name: application.name,
        panNumber: application.panNumber,
        aadhaarNumber: application.aadhaarNumber
      },
      seeded: identity
        ? {
            name: identity.name,
            panNumber: identity.panNumber,
            aadhaarNumber: identity.aadhaarNumber
          }
        : null,
      documents: application.documents?.map(documentSummary) || [],
      checks: application.checks
    };
    res.json({ application, user, identity, adminReview });
  } catch (error) {
    next(error);
  }
}

export async function approveKyc(req, res, next) {
  try {
    const application = await KycApplication.findByIdAndUpdate(
      req.params.id,
      { status: "approved", adminRemarks: req.body.remarks || "", reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: "KYC application not found" });
    await UserProfile.findOneAndUpdate({ userId: application.userId }, { kycStatus: "approved", pan: application.panNumber });
    await notifyUser(application.userId, "KYC Approved", "Your KYC has been approved. You can now invest in stocks.", "kyc");
    await audit(req, "KYC_APPROVED", "kyc", application._id.toString(), { remarks: req.body.remarks });
    res.json({ application });
  } catch (error) {
    next(error);
  }
}

export async function rejectKyc(req, res, next) {
  try {
    const application = await KycApplication.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", adminRemarks: req.body.remarks || "", reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: "KYC application not found" });
    await UserProfile.findOneAndUpdate({ userId: application.userId }, { kycStatus: "rejected" });
    await notifyUser(application.userId, "KYC Rejected", req.body.remarks || "Your KYC was rejected. Please reupload documents.", "kyc");
    await audit(req, "KYC_REJECTED", "kyc", application._id.toString(), { remarks: req.body.remarks });
    res.json({ application });
  } catch (error) {
    next(error);
  }
}
