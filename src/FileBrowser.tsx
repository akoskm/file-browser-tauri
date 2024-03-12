import { useEffect, useState } from "react";
import { homeDir, resolve } from "@tauri-apps/api/path";
import { readDir } from "@tauri-apps/api/fs";
import "./index.css";

interface File {
  name: string;
  isDir: boolean;
}

const Item = ({
  handleClick,
  file,
}: {
  handleClick: (fileName: string) => void;
  file: File;
}): JSX.Element => (
  <div
    key={file.name}
    className={file.isDir ? "dir" : "file"}
    onClick={() => {
      if (!file.isDir) return;

      handleClick(file.name);
    }}
  >
    {file.isDir ? "📁" : "📄"}
    {file.name}
    {file.isDir ? "/" : ""}
  </div>
);

const FileBrowser = (): JSX.Element => {
  const [files, setFiles] = useState<File[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");

  useEffect(() => {
    async function getHomeDir() {
      const homeDirPath = await homeDir();
      setCurrentPath(homeDirPath);
    }

    getHomeDir();
  }, []);

  useEffect(() => {
    async function getFiles() {
      const contents = await readDir(currentPath);

      const entries = [
        { name: ".", children: [] },
        { name: "..", children: [] },
        ...contents,
      ];

      const names = entries.map((entry) => ({
        name: entry.name || "",
        isDir: !!entry.children,
      }));

      setFiles(names);
    }
    getFiles();
  }, [currentPath]);

  async function handleClick(name: string) {
    const newPath = await resolve(currentPath, name);
    setCurrentPath(newPath);
  }

  return (
    <div className="files">
      <div className="dirname">Files in {currentPath}</div>
      <div className="filelist">
        {files.map((file: File) => (
          <Item handleClick={handleClick} file={file} />
        ))}
      </div>
    </div>
  );
};
export default FileBrowser;
