import { Briefcase, Lock, Plus, Share } from "lucide-react";
import React, { useState } from "react";
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
import { User } from "@/lib/supabase/supabase.types";
import { useAppState } from "@/lib/providers/state-provider";
import { addCollaborators } from "@/lib/supabase/queries";

const SettingsForm = () => {
  const { user, subscription } = useSupabaseUserContext();
  const { state, workspaceId, dispatch } = useAppState();
  const [permissions, setPermissions] = useState("private");
  const [collaborators, setCollaborators] = useState<User[] | []>([]);

  const addCollaborator = async (profile: User) => {
    if (!workspaceId) return;
    if (subscription?.status !== "active" && collaborators.length >= 2) {
      return;
    }
    await addCollaborators([profile], workspaceId);
    setCollaborators((prev) => [...prev, profile]);
  };

  return (
    <div>
      <p>
        <Briefcase />
        Workspace
      </p>
      <Separator />
      <div>
        <Label>Name</Label>
        <Input name="workspaceName" placeholder="Workspace Name" />
        <Label>Workspace Logo</Label>
        <Input
          name="workspaceLogo"
          type="file"
          accept="image/*"
          placeholder="Workspace Logo"
        />
        {subscription?.status !== "active" && (
          <small>
            To customize your workspace, you need to be on a Pro Plan
          </small>
        )}
      </div>
      <>
        <Label>Permissions</Label>
        <Select>
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
                      Your workspace is private to you. You can choose to share
                      it later.
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
          </div>
        )}
      </>
    </div>
  );
};

export default SettingsForm;
