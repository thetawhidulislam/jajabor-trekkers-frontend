"use client";

import { useState } from "react";
import { createUploadSignature, type CloudinaryUpload } from "@/lib/api/admin-uploads";
import { messages } from "@/messages/en";

type UploadTask = {
  id: string;
  name: string;
  progress: number;
  error?: string;
  retry: () => void;
};

function isCloudinaryUpload(value: unknown): value is CloudinaryUpload {
  return typeof value === "object" && value !== null
    && "secure_url" in value && typeof value.secure_url === "string";
}

async function uploadImage(file: File, onProgress: (progress: number) => void) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error(messages.admin.uploadTypeError);
  }
  if (file.size > 5 * 1024 * 1024) throw new Error(messages.admin.uploadSizeError);

  const signatureResult = await createUploadSignature({ folder: "destinations" });
  const signature = signatureResult.data;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("folder", signature.folder);
  formData.append("signature", signature.signature);

  return new Promise<string>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/image/upload`,
    );
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onerror = () => reject(new Error(messages.admin.uploadError));
    request.onload = () => {
      let payload: unknown;
      try {
        payload = JSON.parse(request.responseText);
      } catch {
        reject(new Error(messages.admin.uploadError));
        return;
      }
      if (request.status < 200 || request.status >= 300 || !isCloudinaryUpload(payload)) {
        reject(new Error(messages.admin.uploadError));
        return;
      }
      resolve(payload.secure_url);
    };
    request.send(formData);
  });
}

export function ImageUpload({
  label,
  multiple = false,
  onUploaded,
}: {
  label: string;
  multiple?: boolean;
  onUploaded: (url: string) => void;
}) {
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const process = async (file: File, id: string) => {
    const retry = () => void process(file, id);
    setTasks((current) => [
      ...current.filter((task) => task.id !== id),
      { id, name: file.name, progress: 0, retry },
    ]);
    try {
      const url = await uploadImage(file, (progress) => {
        setTasks((current) => current.map((task) => task.id === id ? { ...task, progress } : task));
      });
      onUploaded(url);
      setTasks((current) => current.filter((task) => task.id !== id));
    } catch (error) {
      setTasks((current) => current.map((task) => task.id === id
        ? { ...task, error: error instanceof Error ? error.message : messages.admin.uploadError }
        : task));
    }
  };

  return (
    <div className="admin-upload">
      <label className="button button-outline admin-upload-button">
        {label}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={multiple}
          aria-label={label}
          onChange={(event) => {
            const files = Array.from(event.currentTarget.files ?? []);
            files.forEach((file) => void process(file, `${file.name}-${file.lastModified}-${Math.random()}`));
            event.currentTarget.value = "";
          }}
        />
      </label>
      <p className="admin-hint">{messages.admin.uploadHelp}</p>
      {tasks.map((task) => (
        <div className="admin-upload-progress" key={task.id}>
          <span>{task.name}</span>
          {task.error
            ? <><span role="alert">{task.error}</span><button type="button" className="button button-outline" onClick={task.retry}>{messages.admin.uploadRetry}</button></>
            : <progress aria-label={messages.admin.uploadProgress} value={task.progress} max={100}>{task.progress}%</progress>}
          {!task.error && <span>{messages.admin.uploading(task.progress)}</span>}
        </div>
      ))}
    </div>
  );
}
