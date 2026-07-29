// Allowed things to upload
export type UploadAccept =
  | "images"
  | "pdf"
  | "images_pdf"
  | "any"
  | "zip"
  | "files_no_zip_pdf"
  | "regular_files_images";

export const acceptMap: Record<UploadAccept, string> = {
  images: "image/*",
  pdf: "application/pdf",
  images_pdf: "image/*,application/pdf",
  zip: ".zip,application/zip",
  files_no_zip_pdf: "*",
  regular_files_images:
    "image/*,.txt,.md,.csv,.json,.html,.css,.js,.ts,.tsx,.py",
  any: "*",
};

const blockedMimeTypes = new Set([
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
]);

const blockedExtensions = new Set(["pdf", "zip"]);

export function filterAcceptedFiles(files: File[], accept: UploadAccept) {
  if (accept !== "files_no_zip_pdf") return files;

  return files.filter((file) => {
    const ext = file.name.split(".").pop()?.toLowerCase();

    return (
      !blockedMimeTypes.has(file.type) && (!ext || !blockedExtensions.has(ext))
    );
  });
}
