export type Theme = 'light' | 'dark';

export type Gender = 'male' | 'female' | 'other';

export type TextingTone = 'sweet' | 'teasing' | 'chaotic' | 'formal' | 'shy' | 'confident';

export type EmojiUsage = 'few' | 'normal' | 'heavy';

export type ClinginessLevel = 'low' | 'medium' | 'high';

export interface UserProfile {
  username: string;
  gender: Gender;
  profilePic?: string;
  theme?: Theme;
}

export interface Message {
  id: string;
  partnerId: string;
  sender: 'user' | 'partner';
  text: string;
  timestamp: number;
  type: 'text';
}

export interface ActivePartner {
  id: string;
  name: string;
  gender: Gender;
  description: string;
  tags: string[];
  defaultTone: TextingTone;
  defaultEmojiUsage: EmojiUsage;
  defaultClinginess: ClinginessLevel;
  interests: string[];
  imageUrl: string;

  nickname?: string;
  memories: string[];

  lastMessageTimestamp?: number;

  customTone?: TextingTone;
  customEmojiUsage?: EmojiUsage;
  customClinginess?: ClinginessLevel;
  customInterests?: string[];
}

export interface CommunityMessage {
  id: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: number;
}

export interface LocalStorageAuth {
  username: string;
  createdAt: number;
}

export interface LocalStorageData {
  userProfile?: UserProfile;
  auth?: LocalStorageAuth;
  activePartners: Record<string, ActivePartner>;
  communityMessages: CommunityMessage[];
}

export interface BaseCharacterTemplate {
  id: string;
  name: string;
  gender: Gender;
  description: string;
  tags: string[];
  defaultTone: TextingTone;
  defaultEmojiUsage: EmojiUsage;
  defaultClinginess: ClinginessLevel;
  interests: string[];
  imageUrl: string;
  // optional extras like cardNote, isRealUser can exist in constants via index signature
  [key: string]: any;
}
