"use client";

import React, { useMemo, useState } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import EmojiPicker from "../global/emoji-picker";
import TooltipComponent from "../global/tooltip-component";
import { PlusIcon, Trash } from "lucide-react";
import { useAppState } from "@/lib/providers/state-provider";
import { createFile, updateFile, updateFolder } from "@/lib/supabase/queries";
import { useToast } from "../ui/use-toast";
import { useSupabaseUserContext } from "@/lib/providers/supabase-user-provider";
import { File } from "@/lib/supabase/supabase.types";
import { v4 } from "uuid";
import clsx from "clsx";

interface DropdownProps {
  title: string;
  id: string;
  listType: "folder" | "file";
  iconId: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  title,
  id,
  listType,
  iconId,
  children,
  disabled,
}) => {
  const { toast } = useToast();
  const { state, workspaceId, dispatch } = useAppState();
  const { user } = useSupabaseUserContext();
  const [isEditing, setIsEditing] = useState(false);

  const folderTitle = useMemo(() => {
    if (listType === "folder") {
      const stateTitle = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === id)?.title;
      if (title === stateTitle || !stateTitle) return title;
      return stateTitle;
    }
  }, [listType, state, title, workspaceId, id]);

  const fileTitle = useMemo(() => {
    if (listType === "file") {
      const fileAndFolderId = id.split("folder");
      const stateTitle = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === fileAndFolderId[0])
        ?.files.find((file) => file.id === fileAndFolderId[1])?.title;
      if (title === stateTitle || !stateTitle) return title;
      return stateTitle;
    }
  }, [listType, state, title, workspaceId, id]);

  const handleFolderTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId) return;
    const fid = id.split("folder");
    if (fid.length === 1) {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          workspaceId,
          folderId: fid[0],
          folder: { title: e.target.value },
        },
      });
    }
  };

  const handleFileTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleFileTitleChange");
    if (!workspaceId) return;
    const fid = id.split("folder");
    if (fid.length === 2 && fid[1]) {
      dispatch({
        type: "UPDATE_FILE",
        payload: {
          workspaceId,
          folderId: fid[0],
          fileId: fid[1],
          file: { title: e.target.value },
        },
      });
    }
  };

  const handleBlur = async () => {
    if (!isEditing) return;
    setIsEditing(false);

    const fid = id.split("folder");

    if (fid.length === 1) {
      if (!folderTitle) return;
      const { error } = await updateFolder({ title }, fid[0]);
      if (error) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Could not update the title for this folder",
        });
      } else
        toast({
          title: "Success",
          description: "Folder title changed.",
        });
    }

    if (fid.length === 2 && fid[1]) {
      if (!fileTitle) return;

      const { error } = await updateFile({ title }, fid[1]);
      if (error) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Could not update the title for this file",
        });
      } else
        toast({
          title: "Success",
          description: "File title changed.",
        });
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChangeEmoji = async (selectedEmoji: string) => {
    if (!workspaceId) return;
    if (listType === "folder") {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          workspaceId,
          folderId: id,
          folder: { iconId: selectedEmoji },
        },
      });

      const { data, error } = await updateFolder({ iconId: selectedEmoji }, id);
      if (error) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Could not update emoji for this folder",
        });
      } else {
        toast({
          title: "Success",
          description: "updated emoji for this folder",
        });
      }
    }
  };

  const moveToTrash = async () => {
    if (!user?.email || !workspaceId) return;
    const fid = id.split("folder");

    if (listType === "folder") {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          workspaceId,
          folderId: fid[0],
          folder: { inTrash: `Deleted by user ${user.email}` },
        },
      });
      const { error } = await updateFolder(
        { inTrash: `Deleted by user ${user.email}` },
        fid[0]
      );
      if (error) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Could not move the folder to trash",
        });
      } else {
        toast({
          title: "Success",
          description: "Moved folder to trash",
        });
      }
    }

    if (listType === "file") {
      dispatch({
        type: "UPDATE_FILE",
        payload: {
          workspaceId,
          folderId: fid[0],
          fileId: fid[1],
          file: { inTrash: `Deleted by user ${user.email}` },
        },
      });
      const { error } = await updateFile(
        { inTrash: `Deleted by user ${user.email}` },
        fid[0]
      );
      if (error) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Could not move the file to trash",
        });
      } else {
        toast({
          title: "Success",
          description: "Moved file to trash",
        });
      }
    }
  };

  const addNewFile = async () => {
    if (!workspaceId) return;
    const newFile: File = {
      folderId: id,
      data: null,
      createdAt: new Date().toISOString(),
      inTrash: null,
      title: "untitled",
      iconId: "📄",
      id: v4(),
      workspaceId,
      bannerUrl: "",
    };
    dispatch({
      type: "ADD_FILE",
      payload: {
        file: newFile,
        folderId: id,
        workspaceId,
      },
    });
    const { error } = await createFile(newFile);
    if (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Could not create a file",
      });
    } else {
      toast({
        title: "Success",
        description: "File created.",
      });
    }
  };

  const isFolder = listType === "folder";
  const groupIdentifies = clsx(
    "dark:text-white whitespace-nowrap flex justify-between items-center w-full relative",
    {
      "group/folder": isFolder,
      "group/file": !isFolder,
    }
  );
  const listStyles = useMemo(
    () =>
      clsx("relative", {
        "border-none text-md": isFolder,
        "border-none ml-6 text-[16px] py-1": !isFolder,
      }),
    [isFolder]
  );
  const hoverStyles = useMemo(
    () =>
      clsx(
        "h-full hidden rounded-sm absolute right-0 items-center justify-center",
        {
          "group-hover/file:block": listType === "file",
          "group-hover/folder:block": listType === "folder",
        }
      ),
    [listType]
  );
  const inputStyles = useMemo(
    () =>
      clsx("outline-none overflow-hidden w-[140px] text-Neutrals/neutrals-7", {
        "bg-muted cursor-text": isEditing,
        "bg-transparent cursor-pointer": !isEditing,
      }),
    [isEditing]
  );

  return (
    <AccordionItem value={id} className={listStyles}>
      <AccordionTrigger
        id={listType}
        disabled={listType === "file"}
        className="hover:no-underline p-2 dark:text-muted-foreground text-sm"
      >
        <div className={groupIdentifies}>
          <div className="flex gap-4 items-center justify-center overflow-hidden">
            <div className="relative">
              <EmojiPicker getValue={handleChangeEmoji}>{iconId}</EmojiPicker>
            </div>
            <input
              type="text"
              value={listType === "folder" ? folderTitle : fileTitle}
              readOnly={!isEditing}
              className={inputStyles}
              onDoubleClick={handleDoubleClick}
              onBlur={handleBlur}
              onChange={
                listType === "folder"
                  ? handleFolderTitleChange
                  : handleFileTitleChange
              }
            />
          </div>
          <div className={hoverStyles}>
            <TooltipComponent message="Delete Folder">
              <Trash
                onClick={moveToTrash}
                size={15}
                className="hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors"
              />
            </TooltipComponent>
            {listType === "folder" && !isEditing && (
              <TooltipComponent message="Add File">
                <PlusIcon
                  onClick={addNewFile}
                  size={15}
                  className="hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors"
                />
              </TooltipComponent>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {state.workspaces
          .find((workspace) => workspace.id === workspaceId)
          ?.folders.find((folder) => folder.id === id)
          ?.files.filter((file) => !file.inTrash)
          .map((file) => {
            const customFileId = `${id}folder${file.id}`;
            return (
              <Dropdown
                key={file.id}
                title={file.title}
                listType="file"
                id={customFileId}
                iconId={file.iconId}
              />
            );
          })}
      </AccordionContent>
    </AccordionItem>
  );
};

export default Dropdown;
