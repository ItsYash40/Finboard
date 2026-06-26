import axios from "axios";
import { getServiceUrls } from "../services/service-urls.js";

let localHandler = null;

export function registerLocalOcrHandler(handler) {
  localHandler = handler;
}

function internalHeaders() {
  return { "x-service-key": process.env.INTERNAL_SERVICE_KEY || "dev-internal-key" };
}

export async function processDocumentOcr(filePath, type) {
  if (localHandler) {
    return localHandler(filePath, type);
  }

  const { ocr } = getServiceUrls();
  const { data } = await axios.post(
    `${ocr}/internal/ocr/process`,
    { filePath, type },
    { headers: internalHeaders(), timeout: 60000 }
  );
  return data;
}
