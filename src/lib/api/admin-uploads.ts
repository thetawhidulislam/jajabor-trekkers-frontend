import { api } from "@/lib/api/client";
import type { paths } from "@/types/api";

export type UploadSignatureBody = NonNullable<
  paths["/api/v1/uploads/signature"]["post"]["requestBody"]
>["content"]["application/json"];

export type UploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

export type CloudinaryUpload = { secure_url: string };

export function createUploadSignature(body: UploadSignatureBody) {
  return api.post<UploadSignature>("/api/v1/uploads/signature", body);
}
