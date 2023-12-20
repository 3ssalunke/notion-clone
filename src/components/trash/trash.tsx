import React from "react";
import CustomDialogTrigger from "../global/custom-dialog-trigger";

interface TrashProps {
  children: React.ReactNode;
}

const Trash: React.FC<TrashProps> = ({ children }) => {
  return <CustomDialogTrigger header="Trash">{children}</CustomDialogTrigger>;
};

export default Trash;
