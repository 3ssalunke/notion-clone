"use client";
import { appFolderType, useAppState } from "@/lib/providers/state-provider";
import { File } from "@/lib/supabase/supabase.types";
import { FileIcon, FolderIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const TrashRestore = () => {
  const { state, workspaceId } = useAppState();
  const [folders, setFolders] = useState<appFolderType[] | []>([]);
  const [files, setFiles] = useState<File[] | []>([]);

  useEffect(() => {
    setFolders(
      state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.filter((folder) => folder.inTrash) || []
    );

    let files: File[] = [];
    state.workspaces
      .find((workspace) => workspace.id === workspaceId)
      ?.folders.forEach((folder) => {
        folder.files.forEach((file) => {
          if (file.inTrash) {
            files.push(file);
          }
        });
      });
    setFiles(files);
  }, [state.workspaces, workspaceId]);

  return (
    <section>
      {!!folders.length && (
        <>
          <h3>Folders</h3>
          {folders.map((folder) => (
            <Link
              className="hover:bg-muted rounded-md p-2 flex items-center justify-between"
              href={`/dashboard/${folder.workspaceId}/${folder.id}`}
              key={folder.id}
            >
              <article>
                <aside className="flex items-center gap-2">
                  <FolderIcon />
                  {folder.title}
                </aside>
              </article>
            </Link>
          ))}
        </>
      )}
      {!!files.length && (
        <>
          <h3>Files</h3>
          {files.map((file) => (
            <Link
              className="hover:bg-muted rounded-md p-2 flex items-center justify-between"
              href={`/dashboard/${file.workspaceId}/${file.folderId}/${file.id}`}
              key={file.id}
            >
              <article>
                <aside className="flex items-center gap-2">
                  <FileIcon />
                  {file.title}
                </aside>
              </article>
            </Link>
          ))}
        </>
      )}
      {!files.length && !folders.length && (
        <div className="text-muted-foreground absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
          No items in Trash
        </div>
      )}
    </section>
  );
};

export default TrashRestore;
