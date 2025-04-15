
export interface SocialMediaConnection {
  platform: 'facebook' | 'twitter' | 'linkedin';
  isConnected: boolean;
  username?: string;
  accessToken?: string;
}

export interface SocialMediaAccounts {
  connections: SocialMediaConnection[];
}
