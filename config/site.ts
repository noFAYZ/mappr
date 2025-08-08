export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "MoneyMappr Pro",
  description:
    "The ultimate data aggregation platform for crypto, banking, and business intelligence.",

  navItems: [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Extensions",
      href: "/extensions",
    },
    {
      label: "Portfolios",
      href: "/portfolios",
    },
    {
      label: "AI Assistant",
      href: "/ai",
    },
    {
      label: "Analytics",
      href: "/analytics",
    },
  ],

  navMenuItems: [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Extensions",
      href: "/extensions",
    },
    {
      label: "Portfolios",
      href: "/portfolios",
    },
    {
      label: "AI Assistant",
      href: "/ai",
    },
    {
      label: "Analytics",
      href: "/analytics",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Billing",
      href: "/billing",
    },
    {
      label: "Help & Support",
      href: "/help",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],

  links: {
    github: "https://github.com/dataaggregator/platform",
    twitter: "https://twitter.com/dataaggregator",
    docs: "https://docs.dataaggregator.com",
    discord: "https://discord.gg/dataaggregator",
    support: "https://support.dataaggregator.com",
  },

  authLinks: {
    profile: "/profile",
    settings: "/settings",
    login: "/auth/login",
    signup: "/auth/signup",
    resetPassword: "/auth/reset-password",
  },

  // Feature flags for different tiers
  features: {
    free: {
      maxExtensions: 2,
      maxPortfolios: 1,
      aiQueries: 50,
      exportFormats: ["csv"],
      support: "community",
    },
    pro: {
      maxExtensions: 10,
      maxPortfolios: -1, // unlimited
      aiQueries: 500,
      exportFormats: ["csv", "json", "pdf"],
      support: "email",
    },
    enterprise: {
      maxExtensions: -1, // unlimited
      maxPortfolios: -1, // unlimited
      aiQueries: -1, // unlimited
      exportFormats: ["csv", "json", "pdf", "xlsx"],
      support: "priority",
    },
  },
};
