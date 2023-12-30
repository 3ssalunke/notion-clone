import React from "react";
import CustomDialogTrigger from "../global/custom-dialog-trigger";
import BannerUploadForm from "./banner-upload-form";

interface BannerUploadProps {
  children: React.ReactNode;
  className?: string;
  dirType: "workspace" | "folder" | "file";
  id: string;
}

const BannerUpload: React.FC<BannerUploadProps> = ({
  children,
  className,
  dirType,
  id,
}) => {
  return (
    <CustomDialogTrigger
      header="Banner Upload"
      content={<BannerUploadForm dirType={dirType} id={id} />}
      className={className}
    >
      {children}
    </CustomDialogTrigger>
  );
};

export default BannerUpload;
