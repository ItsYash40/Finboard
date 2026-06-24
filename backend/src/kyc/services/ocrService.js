import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import { env } from "../../config/env.js";

function parseFallback(text, type) {
  const panNumber = text.match(/[A-Z]{5}[0-9]{4}[A-Z]/i)?.[0]?.toUpperCase();
  const aadhaarNumber = text.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/)?.[0]?.replace(/\s/g, "");
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const name = lines.find((line) => /^[A-Za-z ]{3,}$/.test(line) && !/government|income|aadhaar|unique|dob/i.test(line));
  return type === "pan" ? { panNumber, name } : { aadhaarNumber, name };
}

async function runMistralOcr(filePath) {
  if (!env.mistralApiKey) {
    return "";
  }

  const form = new FormData();
  form.append("purpose", "ocr");
  form.append("file", fs.createReadStream(filePath));

  const upload = await axios.post("https://api.mistral.ai/v1/files", form, {
    headers: {
      Authorization: `Bearer ${env.mistralApiKey}`,
      ...form.getHeaders()
    }
  });

  const signed = await axios.get(`https://api.mistral.ai/v1/files/${upload.data.id}/url`, {
    headers: { Authorization: `Bearer ${env.mistralApiKey}` }
  });

  const result = await axios.post(
    "https://api.mistral.ai/v1/ocr",
    {
      model: "mistral-ocr-latest",
      document: {
        type: "image_url",
        image_url: signed.data.url
      }
    },
    {
      headers: {
        Authorization: `Bearer ${env.mistralApiKey}`,
        "Content-Type": "application/json"
      }
    }
  );

  return result.data.pages?.map((page) => page.markdown).join("\n\n") || "";
}

async function extractWithOpenRouter(ocrText, type) {
  if (!env.openRouterApiKey || !ocrText) {
    return parseFallback(ocrText, type);
  }

  const prompt =
    type === "pan"
      ? "Extract JSON only with keys panNumber and name from this Indian PAN OCR text."
      : "Extract JSON only with keys aadhaarNumber and name from this Indian Aadhaar OCR text.";

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: env.openRouterModel,
      messages: [
        { role: "system", content: "Return valid minified JSON only. No markdown." },
        { role: "user", content: `${prompt}\n\nOCR:\n${ocrText}` }
      ],
      temperature: 0
    },
    {
      headers: {
        Authorization: `Bearer ${env.openRouterApiKey}`,
        "Content-Type": "application/json"
      }
    }
  );

  const content = response.data.choices?.[0]?.message?.content || "{}";
  try {
    return JSON.parse(content);
  } catch {
    return parseFallback(ocrText, type);
  }
}

export async function processDocument(filePath, type) {
  try {
    const ocrText = await runMistralOcr(filePath);
    const extracted = await extractWithOpenRouter(ocrText, type);
    return {
      ocrText,
      extracted,
      extractionSource: ocrText ? (env.openRouterApiKey ? "mistral_openrouter" : "mistral_regex") : "not_extracted"
    };
  } catch (error) {
    console.warn(`OCR skipped for ${type}:`, error.response?.data || error.message);
    return {
      ocrText: "",
      extracted: {},
      extractionSource: "ocr_error"
    };
  }
}
