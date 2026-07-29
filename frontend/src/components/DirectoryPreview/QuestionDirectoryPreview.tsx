import { CiFolderOn } from "react-icons/ci";
import { FaHtml5, FaJsSquare, FaPython } from "react-icons/fa";
import {
  MdImage,
  MdInsertDriveFile,
  MdOutlineSubdirectoryArrowRight,
} from "react-icons/md";

function FileIcon({ filename }: { filename: string }) {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (ext === "html") return <FaHtml5 className="shrink-0 text-orange-400" />;
  if (ext === "js") return <FaJsSquare className="shrink-0 text-yellow-300" />;
  if (ext === "py") return <FaPython className="shrink-0 text-blue-300" />;
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext ?? "")) {
    return <MdImage className="shrink-0 text-emerald-300" />;
  }

  return <MdInsertDriveFile className="shrink-0 text-text-muted" />;
}

function FilePreview({ file, showIcons }: { file: File; showIcons: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm text-text-muted">
      {showIcons ? (
        <FileIcon filename={file.name} />
      ) : (
        <MdOutlineSubdirectoryArrowRight className="shrink-0 text-text-soft" />
      )}
      <span className="font-mono text-text">{file.name}</span>
    </div>
  );
}

function FolderHeader({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 font-semibold text-text">
      <CiFolderOn className="shrink-0 text-lg text-accent" />
      <span>{name}</span>
    </div>
  );
}

type DirectoryPreviewProps = {
  files: File[];
  rootName?: string;
  showIcons?: boolean;
};

export function DirectoryPreview({
  files,
  rootName = "Directory",
  showIcons = false,
}: DirectoryPreviewProps) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <h2 className="self-center text-base font-semibold text-text">
        Directory Preview
      </h2>

      <div className="rounded-lg border border-border bg-code/70 p-4">
        <FolderHeader name={`${rootName}/`} />

        {files.length > 0 ? (
          <div className="mt-2 flex flex-col gap-2 pl-6">
            {files.map((file, index) => (
              <FilePreview
                key={`${file.name}-${index}`}
                file={file}
                showIcons={showIcons}
              />
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-text-muted">No files uploaded yet.</p>
        )}
      </div>
    </section>
  );
}
