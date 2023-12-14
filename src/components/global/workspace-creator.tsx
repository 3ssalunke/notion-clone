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
import { Lock } from "lucide-react";
import CollaboratorSearch from "./collaborator-search";

const WorkspaceCreator = () => {
  const [title, setTitle] = useState("");
  const [permissions, setPermissions] = useState("private");

  return (
    <div>
      <div>
        <Label htmlFor="name">Name</Label>
        <div>
          <Input
            name="name"
            value={title}
            placeholder="Workspace Name"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>
      <>
        <Label htmlFor="permissions">Permission</Label>
        <div>
          <Select
            defaultValue={permissions}
            onValueChange={(val) => setPermissions(val)}
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
                        Your workspace is private to you. You can choose to
                        share it later.
                      </p>
                    </article>
                  </div>
                </SelectItem>
                <SelectItem value="shared">
                  <div>
                    <Lock />
                    <article>
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
          <CollaboratorSearch />
        </div>
      )}
    </div>
  );
};

export default WorkspaceCreator;
