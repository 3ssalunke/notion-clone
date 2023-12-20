"use client";

import {
  Briefcase,
  CreditCard,
  ExternalLink,
  Lock,
  LogOut,
  Plus,
  Share,
  UserIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useSupabaseUserContext } from "@/lib/providers/supabase-user-provider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import CollaboratorSearch from "../global/collaborator-search";
import { Button } from "../ui/button";
import { User, Workspace } from "@/lib/supabase/supabase.types";
import { useAppState } from "@/lib/providers/state-provider";
import {
  addCollaborators,
  deleteWorkspace,
  removeCollaborators,
  updateWorkspace,
} from "@/lib/supabase/queries";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Alert, AlertDescription } from "../ui/alert";
import CypressProfileIcon from "../icons/cypressProfileIcon";
import LogoutButton from "../global/logout-button";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { v4 } from "uuid";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";

const SettingsForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { user, subscription } = useSupabaseUserContext();
  const { state, workspaceId, dispatch } = useAppState();
  const supabase = createClientComponentClient();
  const [permissions, setPermissions] = useState("private");
  const [collaborators, setCollaborators] = useState<User[] | []>([]);
  const [workspaceDetails, setWorkspaceDetails] = useState<Workspace>();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [openAlertMessage, setOpenAlertMessage] = useState(false);
  const titleTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const addCollaborator = async (profile: User) => {
    if (!workspaceId) return;
    if (subscription?.status !== "active" && collaborators.length >= 2) {
      return;
    }
    await addCollaborators([profile], workspaceId);
    setCollaborators((prev) => [...prev, profile]);
  };

  const handleWorkspaceNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!workspaceId || !e.target.value) return;
    dispatch({
      type: "UPDATE_WORKSPACE",
      payload: { workspace: { title: e.target.value }, workspaceId },
    });
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(async () => {
      await updateWorkspace({ title: e.target.value }, workspaceId);
    }, 5000);
  };

  const handleWorkspaceLogoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!workspaceId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const uuid = v4();
    setUploadingLogo(true);
    const { data, error } = await supabase.storage
      .from("workspace-logos")
      .upload(`workspaceLogo.${uuid}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (!error) {
      dispatch({
        type: "UPDATE_WORKSPACE",
        payload: { workspace: { logo: data.path }, workspaceId },
      });
      await updateWorkspace({ logo: data.path }, workspaceId);
      setUploadingLogo(false);
    }
  };

  const handlePermissionChange = (val: string) => {
    if (val === "private") {
      setOpenAlertMessage(true);
    } else setPermissions(val);
  };

  const handleRemoveCollaborator = async (user: User) => {
    if (!workspaceId) return;
    if (collaborators.length === 1) {
      setPermissions("private");
    }
    await removeCollaborators([user], workspaceId);
    setCollaborators(collaborators.filter((c) => c.id !== user.id));
    router.refresh();
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceId) return;
    await deleteWorkspace(workspaceId);
    toast({ title: "Succesfully deleted your workspace" });
    dispatch({ type: "DELETE_WORKSPACE", payload: workspaceId });
    router.replace("/dashboard");
  };

  const handleClickAlertConfirm = async () => {
    if (!workspaceId) return;
    if (collaborators.length > 0) {
      await removeCollaborators(collaborators, workspaceId);
    }
    setPermissions("private");
    setOpenAlertMessage(false);
  };

  useEffect(() => {
    const showingWorkspace = state.workspaces.find((w) => w.id === workspaceId);
    if (showingWorkspace) setWorkspaceDetails(showingWorkspace);
  }, [workspaceId, state]);

  return (
    <div>
      <p>
        <Briefcase size={20} />
        Workspace
      </p>

      <Separator />

      <div>
        <Label htmlFor="workspace-name">Name</Label>
        <Input
          name="workspace-name"
          placeholder="Workspace Name"
          value={workspaceDetails ? workspaceDetails.title : ""}
          onChange={handleWorkspaceNameChange}
        />
        <Label>Workspace Logo</Label>
        <Input
          name="workspaceLogo"
          type="file"
          accept="image/*"
          placeholder="Workspace Logo"
          onChange={handleWorkspaceLogoChange}
          disabled={uploadingLogo || subscription?.status !== "active"}
        />
        {subscription?.status !== "active" && (
          <small>
            To customize your workspace, you need to be on a Pro Plan
          </small>
        )}
      </div>

      <Label htmlFor="permissions">Permissions</Label>
      <Select
        name="permissions"
        value={permissions}
        onValueChange={handlePermissionChange}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="private">
              <div>
                <Lock />
                <article>
                  <span>Private</span>
                  <p>
                    Your workspace is private to you. You can choose to share it
                    later.
                  </p>
                </article>
              </div>
            </SelectItem>
            <SelectItem value="shared">
              <div>
                <Share />
                <article>
                  <span>Shared</span>
                  <span>You can invite collaborators.</span>
                </article>
              </div>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {permissions === "shared" && (
        <div>
          <CollaboratorSearch
            existingCollaborators={collaborators}
            getCollaborator={(user) => addCollaborator(user)}
          >
            <Button type="button">
              <Plus />
              Add Collaborators
            </Button>
          </CollaboratorSearch>
          <div>
            <span>Collaborators {collaborators.length || ""}</span>
            <ScrollArea>
              {collaborators.length ? (
                collaborators.map((c) => (
                  <div key={c.id}>
                    <div>
                      <Avatar>
                        <AvatarImage src="/avatars/7.png" />
                        <AvatarFallback>PJ</AvatarFallback>
                      </Avatar>
                      <div>{c.email}</div>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => handleRemoveCollaborator(c)}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              ) : (
                <div>
                  <span>You have no collaborators</span>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      )}

      <Alert variant="destructive">
        <AlertDescription>
          Warning! deleting you workspace will permanantly delete all data
          related to this workspace.
        </AlertDescription>
        <Button
          type="submit"
          variant="destructive"
          size="sm"
          onClick={handleDeleteWorkspace}
        >
          Delete Workspace
        </Button>
      </Alert>

      <p>
        <UserIcon /> Profile
      </p>

      <Separator />

      <div>
        <Avatar>
          <AvatarImage src="" />
          <AvatarFallback>
            <CypressProfileIcon />
          </AvatarFallback>
        </Avatar>
        <div>
          <small>{user ? user.email : ""}</small>
          <Label htmlFor="profile-picture">Profile picture</Label>
          <Input
            name="profile-picture"
            type="file"
            accept="image/*"
            placeholder="Profile Picture"
            disabled
          />
        </div>
      </div>

      <LogoutButton>
        <LogOut />
      </LogoutButton>

      <p>
        <CreditCard size={20} /> Billing & Plan
      </p>

      <Separator />

      <p>
        You are currently on a{" "}
        {subscription?.status === "active" ? "Pro" : "Free"} Plan
      </p>

      <Link href="/" target="_blank">
        View Plans <ExternalLink />
      </Link>

      {subscription?.status === "active" ? (
        <div>
          <Button>Manage Subscription</Button>
        </div>
      ) : (
        <Button type="button" size="sm" variant="secondary">
          Start Plan
        </Button>
      )}

      <AlertDialog open={openAlertMessage}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDescription>
              Changing a Shared workspace to a Private workspace will remove all
              collaborators permanantly.
            </AlertDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClickAlertConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SettingsForm;
