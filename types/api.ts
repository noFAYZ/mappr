export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ExtensionConnectionRequest {
  extensionId: string;
  connectionName: string;
  credentials: Record<string, any>;
}

export interface SyncRequest {
  userExtensionId: string;
  dataTypes?: string[];
}

export interface PortfolioCreateRequest {
  name: string;
  description?: string;
  configuration?: Record<string, any>;
}

export interface PortfolioItemCreateRequest {
  userExtensionId: string;
  itemType: string;
  itemIdentifier: string;
  itemName?: string;
  metadata?: Record<string, any>;
}
