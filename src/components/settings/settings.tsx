import React from "react";
import CustomDialogTrigger from "../global/custom-dialog-trigger";

interface SettingsProps {
  children: React.ReactNode;
}

const Settings: React.FC<SettingsProps> = ({ children }) => {
  return <CustomDialogTrigger header="Settigs">{children}</CustomDialogTrigger>;
};

export default Settings;
