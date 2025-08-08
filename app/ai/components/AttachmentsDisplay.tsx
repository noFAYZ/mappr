"use client";

import React from "react";
import { Card } from "@heroui/react";
import { FileText, Image, Video, Music, Archive, File } from "lucide-react";

import { type MessageAttachment } from "./types";

interface AttachmentsDisplayProps {
  attachments: MessageAttachment[];
}

export const AttachmentsDisplay: React.FC<AttachmentsDisplayProps> = React.memo(
  ({ attachments }) => {
    const getFileIcon = (type: string) => {
      if (type.startsWith("image/")) return <Image className="w-3 h-3" />;
      if (type.startsWith("video/")) return <Video className="w-3 h-3" />;
      if (type.startsWith("audio/")) return <Music className="w-3 h-3" />;
      if (type.includes("archive") || type.includes("zip"))
        return <Archive className="w-3 h-3" />;
      if (type.includes("text") || type.includes("document"))
        return <FileText className="w-3 h-3" />;

      return <File className="w-3 h-3" />;
    };

    const formatFileSize = (bytes?: number) => {
      if (!bytes) return "";
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));

      return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    };

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {attachments.map((attachment) => (
          <Card
            key={attachment.id}
            className="p-2 bg-default-100/50 hover:bg-default-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              {getFileIcon(attachment.type)}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium truncate max-w-32">
                  {attachment.name}
                </span>
                {attachment.size && (
                  <span className="text-xs text-default-500">
                    {formatFileSize(attachment.size)}
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  },
);

AttachmentsDisplay.displayName = "AttachmentsDisplay";
