import axios from "axios";
import Tesseract from "tesseract.js";
import { getServiceEnv } from "@finboard/config";

function normalizeAadhaar(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 12);
}

function cleanJsonContent(content) {
  return String(content || "")
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function parseFallback(text, type) {
  const panNumber = text.match(/[A-Z]{5}[0-9]{4}[A-Z]/i)?.[0]?.toUpperCase();
  const aadhaarNumber = normalizeAadhaar(text.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/)?.[0]);
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/\s+/g, " "))
    .filter(Boolean);
  const name = lines.find((line) => /^[A-Za-z][A-Za-z ]{2,}$/.test(line) && !/government|income|aadhaar|unique|dob|birth|male|female|year|address|permanent/i.test(line));

  return type === "pan"
    ? { panNumber: panNumber || "", name: name || "" }
    : { aadhaarNumber: aadhaarNumber || "", name: name || "" };
}

async function runTesseractOcr(filePath) {
  const result = await Tesseract.recognize(filePath, "eng", {
    logger: () => {}
  });

  return result.data?.text?.trim() || "";
}

async function extractWithOpenRouter(ocrText, type) {
  const fallback = parseFallback(ocrText, type);

  if (!getServiceEnv().openRouterApiKey || !ocrText) {
    return fallback;
  }

  const expectedKeys = type === "pan" ? "name, panNumber" : "name, aadhaarNumber";
  const prompt =
    type === "pan"
      ? "Extract the Indian PAN card holder name and PAN number from OCR text."
      : "Extract the Aadhaar holder name and 12 digit Aadhaar number from OCR text.";

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: getServiceEnv().openRouterModel,
        messages: [
          {
            role: "system",
            content: `Return valid minified JSON only with keys: ${expectedKeys}. Use empty string for missing values. Do not include markdown.`
          },
          {
            role: "user",
            content: `${prompt}\n\nOCR TEXT:\n${ocrText}`
          }
        ],
        temperature: 0
      },
      {
        headers: {
          Authorization: `Bearer ${getServiceEnv().openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "Finboard KYC OCR Simulation"
        }
      }
    );

    const content = cleanJsonContent(response.data.choices?.[0]?.message?.content || "{}");
    const parsed = JSON.parse(content);

    if (type === "pan") {
      return {
        name: parsed.name || fallback.name || "",
        panNumber: String(parsed.panNumber || fallback.panNumber || "").toUpperCase()
      };
    }

    return {
      name: parsed.name || fallback.name || "",
      aadhaarNumber: normalizeAadhaar(parsed.aadhaarNumber || fallback.aadhaarNumber)
    };
  } catch (error) {
    console.warn(`OpenRouter extraction fallback for ${type}:`, error.response?.data || error.message);
    return fallback;
  }
}

export async function processDocument(filePath, type) {
  try {
    const ocrText = await runTesseractOcr(filePath);
    const extracted = await extractWithOpenRouter(ocrText, type);

    return {
      ocrText,
      extracted,
      extractionSource: getServiceEnv().openRouterApiKey ? "tesseract_openrouter" : "tesseract_regex"
    };
  } catch (error) {
    console.warn(`Tesseract OCR failed for ${type}:`, error.message);
    return {
      ocrText: "",
      extracted: {},
      extractionSource: "ocr_error"
    };
  }
}
