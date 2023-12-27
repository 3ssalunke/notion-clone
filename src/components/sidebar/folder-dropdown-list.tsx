"use client";

import React, { useState } from "react";
import TooltipComponent from "../global/tooltip-component";
import { PlusIcon } from "lucide-react";
import { Accordion } from "../ui/accordion";
import { Folder } from "@/lib/supabase/supabase.types";
import Dropdown from "./dropdown";

interface FolderDropdownListProps {
  workspaceFolders: Folder[];
  workspaceId: string;
}

const FolderDropdownList: React.FC<FolderDropdownListProps> = ({
  workspaceFolders,
  workspaceId,
}) => {
  const [folders, setFolders] = useState(workspaceFolders);

  return (
    <>
      <div>
        <span>FOLDERS</span>
        <TooltipComponent message="create folder">
          <PlusIcon />
        </TooltipComponent>
      </div>
      <Accordion type="multiple">
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
