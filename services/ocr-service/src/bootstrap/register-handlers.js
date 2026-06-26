import { registerLocalOcrHandler } from "@finboard/contracts";
import { processDocument } from "../modules/ocr/index.js";

export function registerOcrHandlers() {
  registerLocalOcrHandler(processDocument);
}
