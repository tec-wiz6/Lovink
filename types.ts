
export type Gender = 'male' | 'female' | 'non-binary' | 'other';
export type Theme = 'light' | 'dark';

export interface UserProfile {
  username: string;
  gender: Gender;
  age: number;
  aboutMe: string;
  profilePic?: string;
  createdAt: number;
  theme?: Theme;
}

export interface AuthData {
  passwordHash: string;
}

export type TextingTone = 'sweet' | 'teasing' | 'chaotic' | 'formal' | 'shy' | 'confident';
export type EmojiUsage = 'few' | 'normal' | 'heavy';
export type ClinginessLevel = 'low' | 'medium' | 'high';

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
  isRealUser?: boolean;
}

export interface ActivePartner extends BaseCharacterTemplate {
  nickname: string;
  customTone?: TextingTone;
  customEmojiUsage?: EmojiUsage;
  customClinginess?: ClinginessLevel;
  customInterests?: string[];
  memories: Memory[];
  lastMessageTimestamp?: number;
}

export interface Message {
  id: string;
  partnerId: string;
  sender: 'user' | 'partner';
  text: string;
  timestamp: number;
  type: 'text' | 'audio' | 'system';
}

export interface Memory {
  fact: string;
  importance: number;
}

export interface LocalStorageData {
  userProfile: UserProfile | null;
  auth: AuthData | null;
  activePartners: Record<string, ActivePartner>;
  chatHistory: Message[];
}
