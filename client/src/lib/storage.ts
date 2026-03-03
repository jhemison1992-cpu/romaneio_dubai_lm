/**
 * Helper para fazer upload de arquivos para S3
 */
export async function storagePut(
  key: string,
  data: File | Blob | string | Buffer,
  contentType?: string
): Promise<{ url: string; key: string }> {
  try {
    // Converter dados para FormData
    const formData = new FormData();
    formData.append("key", key);
    formData.append("file", data as Blob);
    if (contentType) {
      formData.append("contentType", contentType);
    }

    // Fazer upload para o servidor
    const response = await fetch("/api/storage/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      url: result.url,
      key: result.key,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

/**
 * Helper para obter URL assinada para download
 */
export async function storageGet(
  key: string,
  expiresIn?: number
): Promise<{ url: string; key: string }> {
  try {
    const response = await fetch(`/api/storage/download?key=${encodeURIComponent(key)}&expiresIn=${expiresIn || 3600}`);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      url: result.url,
      key: result.key,
    };
  } catch (error) {
    console.error("Error getting file:", error);
    throw error;
  }
}
