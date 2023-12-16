"use client";

import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Lock, Plus, Share } from "lucide-react";
import CollaboratorSearch from "./collaborator-search";
import { User, Workspace } from "@/lib/supabase/supabase.types";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { v4 } from "uuid";
import { useSupabaseUserContext } from "@/lib/providers/supabase-user-provider";
import { useToast } from "../ui/use-toast";
import { addCollaborators, createWorkspace } from "@/lib/supabase/queries";
import { useRouter } from "next/navigation";

const WorkspaceCreator = () => {
  const { user } = useSupabaseUserContext();
  const [title, setTitle] = useState("");
  const [permissions, setPermissions] = useState("private");
  const [collaborators, setCollaborators] = useState<User[] | []>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const addCollaborator = (user: User) => {
    setCollaborators((prev) => [...prev, user]);
  };

  const removeCollaborator = (user: User) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== user.id));
  };

  const createItem = async () => {
    setIsLoading(true);
    const uuid = v4();
    if (user?.id) {
      const newWorkspace: Workspace = {
        data: null,
        createdAt: new Date().toISOString(),
        iconId: "💼",
        id: uuid,
        inTrash: "",
        title,
        workspaceOwner: user.id,
        logo: null,
        bannerUrl: "",
      };
      if (permissions === "private") {
        toast({ title: "Success", description: "Created a Workspace" });
        await createWorkspace(newWorkspace);
        router.refresh();
      }
      if (permissions === "shared") {
        toast({ title: "Success", description: "Created a Workspace" });
        await createWorkspace(newWorkspace);
        await addCollaborators(collaborators, uuid);
        router.refresh();
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="flex gap-4 flex-col">
      <div>
        <Label htmlFor="name" className="text-sm text-muted-foreground">
          Name
        </Label>
        <div className="flex justify-center items-center gap-2">
          <Input
            name="name"
            value={title}
            placeholder="Workspace Name"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>
      <>
        <Label htmlFor="permissions" className="text-sm text-muted-foreground">
          Permission
        </Label>
        <div>
          <Select
            defaultValue={permissions}
            onValueChange={(val) => setPermissions(val)}
          >
            <SelectTrigger className="w-full h-26 -mt-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="private">
                  <div className="p-2 flex gap-4 justify-center items-center">
                    <Lock />
                    <article className="text-left flex flex-col">
                      <span>Private</span>
                      <p>
                        Your workspace is private to you. You can choose to
                        share it later.
                      </p>
                    </article>
                  </div>
                </SelectItem>
                <SelectItem value="shared">
                  <div className="p-2 flex gap-4 justify-center items-center">
                    <Share />
                    <article className="text-left flex flex-col">
                      <span>Shared</span>
                      <p>You can invite collaborators.</p>
                    </article>
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </>
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
                      <Button onClick={() => removeCollaborator(c)}>
                        Remove
                      </Button>
                    </div>
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
      <Button
        type="button"
        disabled={
          !title ||
          (permissions === "shared" && collaborators.length === 0) ||
          isLoading
        }
        variant="secondary"
        onClick={createItem}
      >
        Create
      </Button>
    </div>
  );
};

export default WorkspaceCreator;
