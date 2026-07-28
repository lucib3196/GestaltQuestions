import { FaHtml5, FaJsSquare, FaPython } from "react-icons/fa";
import { MdImage, MdInsertDriveFile } from "react-icons/md";

type FileIconProps = {
  filename: string;
  className?: string;
};

export function FileIcon({ filename, className }: FileIconProps) {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (ext === "html") {
    return <FaHtml5 className={className ?? "text-orange-400"} size={28} />;
  }

  if (ext === "js") {
    return <FaJsSquare className={className ?? "text-yellow-300"} size={28} />;
  }

  if (ext === "py") {
    return <FaPython className={className ?? "text-blue-300"} size={28} />;
  }

  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext ?? "")) {
    return <MdImage className={className ?? "text-emerald-300"} size={30} />;
  }

  return (
    <MdInsertDriveFile className={className ?? "text-text-muted"} size={28} />
  );
}
