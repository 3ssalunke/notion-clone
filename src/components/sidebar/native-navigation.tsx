import Link from "next/link";
import React from "react";
import CypressHomeIcon from "../icons/cypressHomeIcon";
import Settings from "../settings/settings";
import CypressSettingsIcon from "../icons/cypressSettingsIcon";
import Trash from "../trash/trash";
import CypressTrashIcon from "../icons/cypressTrashIcon";

interface NativeNavigationProps {
  myWorkspaceId: string;
  className?: string;
}

const NativeNavigation: React.FC<NativeNavigationProps> = ({
  myWorkspaceId,
  className,
}) => {
  return (
    <nav>
      <ul>
        <li>
          <Link href={`/dashboard/${myWorkspaceId}`}>
            <CypressHomeIcon />
            <span>My Workspace</span>
          </Link>
        </li>

        <Settings>
          <CypressSettingsIcon />
          <span>Settings</span>
        </Settings>

        <Trash>
          <CypressTrashIcon />
          <span>Trash</span>
        </Trash>
      </ul>
    </nav>
  );
};

export default NativeNavigation;
