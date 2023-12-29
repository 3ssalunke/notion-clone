"use client";

import { useAppState } from "@/lib/providers/state-provider";
import { File, Folder, Workspace } from "@/lib/supabase/supabase.types";
import React, { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { Tooltip } from "../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import EmojiPicker from "../global/emoji-picker";
import { XCircleIcon } from "lucide-react";
import BannerUpload from "../banner-upload/banner-upload";

interface QuillEditorProps {
  dirType: "file" | "folder" | "workspace";
  dirDetails: File | Folder | Workspace;
  fileId: string;
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  dirType,
  dirDetails,
  fileId,
}) => {
  const { state, workspaceId, folderId } = useAppState();
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const [collaborators, setCollaborators] = useState<
    { id: string; email: string; avatarUrl: string }[]
  >([]);
  const [saving, setSaving] = useState(false);

  const details = useMemo(() => {
    let selectedDir;
    if (dirType === "file") {
      selectedDir = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === folderId)
        ?.files.find((file) => file.id === fileId);
    }
    if (dirType === "folder") {
      selectedDir = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === folderId);
    }
    if (dirType === "workspace") {
      selectedDir = state.workspaces.find(
        (workspace) => workspace.id === workspaceId
      );
    }

    if (selectedDir) return selectedDir;

    return {
      title: dirDetails.title,
      iconId: dirDetails.iconId,
      bannerUrl: dirDetails.bannerUrl,
      createdAt: dirDetails.createdAt,
      data: dirDetails.data,
      inTrash: dirDetails.inTrash,
    };
  }, [dirType, state, workspaceId, folderId, fileId, dirDetails]);

  const breadCrumbs = useMemo(() => {
    if (!pathname || !state.workspaces || !workspaceId) return;
    const segments = pathname
      .split("/")
      .filter((val) => val && val !== "dashboard");
    const workspaceDetails = state.workspaces.find(
      (workspace) => workspace.id === workspaceId
    );
    const workspaceBreadCrumb = workspaceDetails
      ? `${workspaceDetails.iconId} ${workspaceDetails.title}`
      : "";
    if (segments.length === 1) return workspaceBreadCrumb;
    const folderSegment = segments[1];
    const folderDetails = workspaceDetails?.folders.find(
      (folder) => folder.id === folderSegment
    );
    const folderBreadCrumb = folderDetails
      ? `${folderDetails.iconId} ${folderDetails.title}`
      : "";
    if (segments.length === 2)
      return `${workspaceBreadCrumb} ${folderBreadCrumb}`;
    const fileSegment = segments[2];
    const fileDetails = folderDetails?.files.find(
      (file) => file.id === fileSegment
    );
    const fileBreadCrumb = fileDetails
      ? `${fileDetails.iconId} ${fileDetails.title}`
      : "";
    if (segments.length === 2)
      return `${workspaceBreadCrumb} ${folderBreadCrumb} ${fileBreadCrumb}`;
  }, [pathname, state, workspaceId]);

  return (
    <>
      <div>
        {details.inTrash && (
          <article>
            <div>
              <span>This {dirType} is in the trash.</span>
              <Button variant="outline" size="sm" onClick={}>
                Restore
              </Button>
              <Button variant="outline" size="sm">
                Delete
              </Button>
            </div>
            <span>{details.inTrash}</span>
          </article>
        )}
        <div>
          <div>{breadCrumbs}</div>
          <div>
            <div>
              {collaborators.map((collaborator) => (
                <TooltipProvider key={collaborator.id}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Avatar>
                        <AvatarImage src={collaborator.avatarUrl ?? ""} />
                        <AvatarFallback>
                          {collaborator.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            {saving ? (
              <Badge variant="secondary">Saving...</Badge>
            ) : (
              <Badge variant="secondary">Saved</Badge>
            )}
          </div>
        </div>
      </div>
      {details.bannerUrl && (
        <div>
          <Image
            src={
              supabase.storage
                .from("file-banners")
                .getPublicUrl(details.bannerUrl).data.publicUrl
            }
            alt="file-banner"
            fill
          />
        </div>
      )}
      <div>
        <div>
          <div>
            <EmojiPicker getValue={}>
              <div>{details.iconId}</div>
            </EmojiPicker>
          </div>
          <div>
            <BannerUpload>
              {details.bannerUrl ? "Update Banner" : "Add Banner"}
            </BannerUpload>
            {details.bannerUrl && (
              <Button>
                <XCircleIcon />
                <span>Remove Banner</span>
              </Button>
            )}
          </div>
          <span>{details.title}</span>
          <span>{dirType.toUpperCase()}</span>
          <div></div>
        </div>
      </div>
    </>
  );
};

export default QuillEditor;
