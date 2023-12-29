import React from "react";
import { cookies } from "next/headers";
import WorkspaceDropdown from "./workspace-dropdown";
import PlanUsage from "./plan-usage";
import NativeNavigation from "./native-navigation";
import FolderDropdownList from "./folder-dropdown-list";
import { ScrollArea } from "../ui/scroll-area";
import UserCard from "./user-card";
import {
  getCollaboratingWorkspaces,
  getFiles,
  getFolders,
  getPrivateWorkspaces,
  getSharedWorkspaces,
  getUserSubscriptionStatus,
} from "@/lib/supabase/queries";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { twMerge } from "tailwind-merge";
import { File } from "@/lib/supabase/supabase.types";

interface SidebarProps {
  params: { workspaceId: string };
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = async ({ params, className }) => {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: subscriptionData, error: subscriptionError } =
    await getUserSubscriptionStatus(user.id);
  const { data: foldersData, error: foldersError } = await getFolders(
    params.workspaceId
  );
  let filesData: File[] = [];
  if (foldersData && foldersData.length > 0) {
    await foldersData.forEach(async (folder) => {
      const { data, error } = await getFiles(folder.id);
      if (!error && data) filesData.push(...data);
    });
  }

  const [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces] =
    await Promise.all([
      getPrivateWorkspaces(user.id),
      getCollaboratingWorkspaces(user.id),
      getSharedWorkspaces(user.id),
    ]);

  return (
    <aside
      className={twMerge(
        "hidden sm:flex sm:flex-col w-[280px] shrink-0 p-4 md:gap-4 justify-between",
        className
      )}
    >
      <div>
        <WorkspaceDropdown
          privateWorkspaces={privateWorkspaces}
          collaboratingWorkspaces={collaboratingWorkspaces}
          sharedWorkspaces={sharedWorkspaces}
          defaultValue={[
            ...privateWorkspaces,
            ...collaboratingWorkspaces,
            ...sharedWorkspaces,
          ].find((workspace) => workspace.id === params.workspaceId)}
        />
        <PlanUsage
          foldersLength={foldersData?.length || 0}
          subscription={subscriptionData}
        />
        <NativeNavigation myWorkspaceId={params.workspaceId} />
        <ScrollArea className="overflow-scroll relative h-[350px] ql-toolbar">
          <div className="pointer-events-none w-full absolute bottom-0 h-20 bg-gradient-to-t from-background to-transparent z-40" />
          <FolderDropdownList
            workspaceFolders={foldersData || []}
            workspaceFiles={filesData || []}
            workspaceId={params.workspaceId}
          />
        </ScrollArea>
        <UserCard subscription={subscriptionData} />
      </div>
    </aside>
  );
};

export default Sidebar;
