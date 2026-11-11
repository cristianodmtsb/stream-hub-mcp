export interface LiveDetails {
  title: string;
  description: string;
  category?: string;
  game?: string;
  tags?: string[];
  scheduledStartTime?: Date;
  thumbnailPath?: string;
  isPrivate?: boolean;
}

export interface LiveResult {
  platform: string;
  success: boolean;
  liveUrl?: string;
  streamKey?: string;
  rtmpUrl?: string;
  error?: string;
}

export interface MultiPlatformResult {
  overallSuccess: boolean;
  results: Record<string, LiveResult>;
}

export interface PlatformConfig {
  clientId?: string;
  clientSecret?: string;
  apiKey?: string;
  channelId?: string;
  channelName?: string;
  [key: string]: any;
}

export interface PlatformTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
  scope?: string;
}

export interface TemplateFrontmatter {
  categories?: Record<string, string>;
  default_tags?: string[];
  [key: string]: any;
}

export interface StreamTemplate {
  name: string;
  frontmatter: TemplateFrontmatter;
  rawBody: string;
}

export interface PlatformAdapter {
  readonly id: string;
  readonly name: string;

  isConfigured(): Promise<boolean>;
  authenticate(): Promise<void>;
  createOrScheduleLive(details: LiveDetails): Promise<LiveResult>;
  updateLive(details: Partial<LiveDetails>): Promise<LiveResult>;
}
