
import { UserProfile, AuthData, ActivePartner, Message, LocalStorageData } from '../types';

const STORAGE_KEY = 'lovink_data_v2';

const initialState: LocalStorageData = {
  userProfile: null,
  auth: null,
  activePartners: {},
  chatHistory: []
};

export const storageService = {
  getData: (): LocalStorageData => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    try {
      return JSON.parse(raw);
    } catch {
      return initialState;
    }
  },

  saveData: (data: LocalStorageData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  setUser: (profile: UserProfile, auth: AuthData) => {
    const data = storageService.getData();
    data.userProfile = profile;
    data.auth = auth;
    storageService.saveData(data);
  },

  addActivePartner: (partner: ActivePartner) => {
    const data = storageService.getData();
    data.activePartners[partner.id] = partner;
    storageService.saveData(data);
  },

  updatePartner: (partnerId: string, updates: Partial<ActivePartner>) => {
    const data = storageService.getData();
    if (data.activePartners[partnerId]) {
      data.activePartners[partnerId] = { ...data.activePartners[partnerId], ...updates };
      storageService.saveData(data);
    }
  },

  removePartner: (partnerId: string) => {
    const data = storageService.getData();
    delete data.activePartners[partnerId];
    data.chatHistory = data.chatHistory.filter(m => m.partnerId !== partnerId);
    storageService.saveData(data);
  },

  addMessage: (msg: Message) => {
    const data = storageService.getData();
    data.chatHistory.push(msg);
    if (data.activePartners[msg.partnerId]) {
      data.activePartners[msg.partnerId].lastMessageTimestamp = msg.timestamp;
    }
    storageService.saveData(data);
  },

  getMessagesForPartner: (partnerId: string): Message[] => {
    const data = storageService.getData();
    return data.chatHistory.filter(m => m.partnerId === partnerId);
  },

  clearData: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
