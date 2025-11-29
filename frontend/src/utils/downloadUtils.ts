export function downloadBase64Zip(base64: string, filename: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: "application/zip" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

export function downloadZip(bytes: string | Blob, header: string | undefined) {
  const filename = extractFilename(header);
  const blob = new Blob([bytes], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function extractFilename(header: string | undefined) {
  if (!header) return "download.zip";

  const match = header.match(/filename="?([^"]+)"?/);
  return match ? match[1] : "download.zip";
}
