"use client";

import React, { useEffect, useState } from "react";
import TooltipComponent from "../global/tooltip-component";
import { PlusIcon } from "lucide-react";
import { Accordion } from "../ui/accordion";
import { File, Folder } from "@/lib/supabase/supabase.types";
import Dropdown from "./dropdown";
import { useAppState } from "@/lib/providers/state-provider";
import { useSupabaseUserContext } from "@/lib/providers/supabase-user-provider";
import { useSubscriptionModalContext } from "@/lib/providers/subscription-modal-provider";
import { v4 } from "uuid";
import { createFolder } from "@/lib/supabase/queries";
import { useToast } from "../ui/use-toast";

interface FolderDropdownListProps {
  workspaceFolders: Folder[];
  workspaceFiles: File[];
  workspaceId: string;
}

const FolderDropdownList: React.FC<FolderDropdownListProps> = ({
  workspaceFolders,
  workspaceFiles,
  workspaceId,
}) => {
  const { state, dispatch, folderId } = useAppState();
  const { subscription } = useSupabaseUserContext();
  const { setOpen } = useSubscriptionModalContext();
  const { toast } = useToast();
  const [folders, setFolders] = useState(workspaceFolders);

  useEffect(() => {
    if (workspaceFolders.length > 0) {
      dispatch({
        type: "SET_FOLDERS",
        payload: {
          workspaceId,
          folders: workspaceFolders.map((folder) => ({
            ...folder,
            files: workspaceFiles.filter((file) => file.folderId === folder.id),
          })),
        },
      });
    }
  }, [workspaceFolders, workspaceId, dispatch, workspaceFiles]);

  useEffect(() => {
    setFolders(
      state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.filter((folder) => !folder.inTrash) || []
    );
  }, [state, workspaceId]);

  const handleAddFolder = async () => {
    let foldersLength =
      state.workspaces.find((workspace) => workspace.id === workspaceId)
        ?.folders.length || 0;
    if (foldersLength >= 3 && !subscription) {
      setOpen(true);
      return;
    }

    const newFolder: Folder = {
      data: null,
      id: v4(),
      createdAt: new Date().toISOString(),
      title: "Untitled",
      iconId: "📁",
      inTrash: null,
      workspaceId,
      bannerUrl: "",
    };

    dispatch({
      type: "ADD_FOLDER",
      payload: { workspaceId, folder: { ...newFolder, files: [] } },
    });
    const { error } = await createFolder(newFolder);
    if (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Could not create the folder",
      });
    } else {
      toast({
        title: "Success",
        description: "Created folder.",
      });
    }
  };

  return (
    <>
      <div className="flex sticky z-20 top-0 bg-background w-full h-10 group/title justify-between items-center pr-4 text-Neutrals/neutrals-8">
        <span className="text-Neutrals/neutrals-8 font-bold text-xs">
          FOLDERS
        </span>
        <TooltipComponent message="create folder">
          <PlusIcon
            onClick={handleAddFolder}
            size={16}
            className="group-hover/title:inline-block cursor-pointer hover:dark:text-white"
          />
        </TooltipComponent>
      </div>
      <Accordion
        type="multiple"
        defaultValue={[folderId || ""]}
        className="pb-20"
      >
        {folders
          .filter((folder) => !folder.inTrash)
          .map((folder) => (
            <Dropdown
              key={folder.id}
              id={folder.id}
              title={folder.title}
              listType="folder"
              iconId={folder.iconId}
            />
          ))}
      </Accordion>
    </>
  );
};

export default FolderDropdownList;
