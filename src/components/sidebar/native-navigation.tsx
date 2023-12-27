import Link from "next/link";
import React from "react";
import CypressHomeIcon from "../icons/cypressHomeIcon";
import Settings from "../settings/settings";
import CypressSettingsIcon from "../icons/cypressSettingsIcon";
import Trash from "../trash/trash";
import CypressTrashIcon from "../icons/cypressTrashIcon";
import { twMerge } from "tailwind-merge";

interface NativeNavigationProps {
  myWorkspaceId: string;
  className?: string;
}

const NativeNavigation: React.FC<NativeNavigationProps> = ({
  myWorkspaceId,
  className,
}) => {
  return (
    <nav className={twMerge("my-2", className)}>
      <ul className="flex flex-col gap-2">
        <li>
          <Link
            href={`/dashboard/${myWorkspaceId}`}
            className="group/native flex text-Neutrals/neutrals-7 transition-all gap-2"
          >
            <CypressHomeIcon />
            <span>My Workspace</span>
          </Link>
        </li>

        <Settings>
          <li className="group/native flex text-Neutrals/neutrals-7 transition-all gap-2">
            <CypressSettingsIcon />
            <span>Settings</span>
          </li>
        </Settings>

        <Trash>
          <li className="group/native flex text-Neutrals/neutrals-7 transition-all gap-2">
            <CypressTrashIcon />
            <span>Trash</span>
          </li>
        </Trash>
      </ul>
    </nav>
  );
};

export default NativeNavigation;
