export const CHAT_CONFIG = {
    features: {
      enableSpeech: true,
      enableFeedback: true,
      enableExport: true,
      enableSearch: true,
      enableAnalytics: true
    },
    ui: {
      maxMessagesPerPage: 50,
      animationDuration: 300,
      showTimestamps: true,
      showMetadata: true
    },
    performance: {
      virtualizeAfter: 100,
      cacheSize: 500,
      lazyLoadImages: true
    }
  };