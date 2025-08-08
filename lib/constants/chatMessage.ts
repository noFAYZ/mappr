"use client";

/**
 * Constants and configuration for ChatMessage components
 */
export const CHAT_MESSAGE_CONFIG = {
  // Performance settings
  MAX_CONTENT_LENGTH: 50000, // Maximum characters to render
  RENDER_TIMEOUT: 5000, // Parsing timeout in milliseconds
  CACHE_SIZE: 100, // Number of parsed messages to cache

  // Speech synthesis settings
  SPEECH_RATE: 0.9,
  SPEECH_PITCH: 1.0,
  SPEECH_VOLUME: 0.8,
  MAX_SPEECH_LENGTH: 5000, // Maximum characters to speak

  // UI settings
  ANIMATION_DURATION: 300,
  TYPING_ANIMATION_SPEED: 50,
  MESSAGE_SPACING: 16,

  // Content parsing
  MAX_CODE_BLOCKS: 10,
  MAX_TABLE_CELLS: 1000,
  MAX_LIST_ITEMS: 100,

  // Security settings
  ALLOWED_HTML_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "code",
    "pre",
    "blockquote",
    "ul",
    "ol",
    "li",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "a",
    "span",
    "div",
  ],

  // Error messages
  ERRORS: {
    PARSE_FAILED: "Failed to parse message content",
    COPY_FAILED: "Failed to copy to clipboard",
    SPEECH_FAILED: "Speech synthesis failed",
    FEEDBACK_FAILED: "Failed to submit feedback",
    REGENERATE_FAILED: "Failed to regenerate message",
    CONTENT_TOO_LONG: "Message content is too long to display",
    INVALID_MESSAGE: "Invalid message format",
  },
} as const;

// Content type configurations
export const CONTENT_TYPES = {
  text: {
    icon: "FileText",
    color: "default",
    bgColor: "bg-default-50",
  },
  analysis: {
    icon: "BarChart3",
    color: "primary",
    bgColor: "bg-primary-50",
  },
  code: {
    icon: "Code",
    color: "secondary",
    bgColor: "bg-secondary-50",
  },
  mixed: {
    icon: "Layers",
    color: "warning",
    bgColor: "bg-warning-50",
  },
} as const;

// Message role configurations
export const MESSAGE_ROLES = {
  user: {
    name: "You",
    avatar: "user",
    alignment: "right",
    bgColor: "bg-primary-500",
    textColor: "text-primary-foreground",
  },
  assistant: {
    name: "Mappr AI",
    avatar: "mappr",
    alignment: "left",
    bgColor: "bg-content1",
    textColor: "text-default-foreground",
  },
  system: {
    name: "System",
    avatar: "system",
    alignment: "center",
    bgColor: "bg-default-100",
    textColor: "text-default-600",
  },
} as const;

// File type configurations for attachments
export const FILE_TYPES = {
  image: {
    icon: "Image",
    color: "success",
    extensions: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
  },
  video: {
    icon: "Video",
    color: "warning",
    extensions: ["mp4", "avi", "mov", "wmv", "flv", "webm"],
  },
  audio: {
    icon: "Music",
    color: "secondary",
    extensions: ["mp3", "wav", "ogg", "aac", "flac"],
  },
  document: {
    icon: "FileText",
    color: "primary",
    extensions: ["pdf", "doc", "docx", "txt", "rtf"],
  },
  spreadsheet: {
    icon: "Table",
    color: "success",
    extensions: ["xls", "xlsx", "csv"],
  },
  archive: {
    icon: "Archive",
    color: "default",
    extensions: ["zip", "rar", "7z", "tar", "gz"],
  },
  code: {
    icon: "Code",
    color: "secondary",
    extensions: ["js", "ts", "py", "java", "cpp", "css", "html", "json"],
  },
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  COPY: ["Ctrl+C", "Cmd+C"],
  SPEAK: ["Ctrl+R", "Cmd+R"],
  REGENERATE: ["Ctrl+Shift+R", "Cmd+Shift+R"],
  EDIT: ["Ctrl+E", "Cmd+E"],
} as const;

// Animation variants for Framer Motion
export const ANIMATION_VARIANTS = {
  message: {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  },
  actions: {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, delay: 0.1 },
    },
    exit: {
      opacity: 0,
      y: 10,
      transition: { duration: 0.15 },
    },
  },
  typing: {
    animate: {
      y: [0, -4, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
} as const;
