"use client";

import React from "react";
import { motion } from "framer-motion";

export const StreamingIndicator: React.FC = React.memo(() => {
  return (
    <div className="flex items-center gap-2 mt-3 text-default-500">
      <div className="flex gap-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{ y: [0, -4, 0] }}
            className="w-1 h-1 bg-current rounded-full"
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <span className="text-xs font-medium">AI is thinking...</span>
    </div>
  );
});

StreamingIndicator.displayName = "StreamingIndicator";
