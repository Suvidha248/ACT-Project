import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { User } from "../types";

export type ChatContextType = {
  isChatOpen: boolean;
  toggleChat: () => void;
  openChats: User[];
  openChatWith: (user: User) => void;
  closeChat: (userId: string) => void;
  unreadCounts: Record<string, number>;
  incrementUnread: (userId: string) => void;
  clearUnreadForUser: (userId: string) => void;
  lastMessages: Record<string, string>;
  updateLastMessage: (userId: string, msg: string) => void;
  markChatAsActive: (userId: string) => void;
  activeChatUserIds: Set<string>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const recentlyCleared = new Set<string>();

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [openChats, setOpenChats] = useState<User[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [lastMessages, setLastMessages] = useState<Record<string, string>>({});
  const [activeChatUserIds, setActiveChatUserIds] = useState<Set<string>>(
    new Set()
  );

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
  }, []);

  const clearUnreadForUser = useCallback((userId: string) => {
    recentlyCleared.add(userId);
    setUnreadCounts((prev) => {
      if (!(userId in prev)) return prev;
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });

    // Automatically remove from recentlyCleared after short delay
    setTimeout(() => {
      recentlyCleared.delete(userId);
    }, 500); // 0.5s grace period to suppress Firestore update race
  }, []);

  const incrementUnread = useCallback(
    (userId: string) => {
      if (recentlyCleared.has(userId)) return; // ✅ Skip if recently cleared
      setUnreadCounts((prev) => {
        if (activeChatUserIds.has(userId)) return prev;
        return {
          ...prev,
          [userId]: (prev[userId] || 0) + 1,
        };
      });
    },
    [activeChatUserIds]
  );

  const updateLastMessage = useCallback((userId: string, msg: string) => {
    setLastMessages((prev) => ({
      ...prev,
      [userId]: msg,
    }));
  }, []);

  const openChatWith = useCallback(
    (user: User) => {
      setOpenChats((prev) => {
        if (prev.find((u) => u.id === user.id)) return prev;
        return [...prev, user];
      });
      setActiveChatUserIds((prev) => new Set(prev).add(user.id));
      clearUnreadForUser(user.id);
      setIsChatOpen(true);
    },
    [clearUnreadForUser]
  );

  const closeChat = useCallback(
    (userId: string) => {
      setOpenChats((prev) => prev.filter((u) => u.id !== userId));
      setActiveChatUserIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      clearUnreadForUser(userId);
    },
    [clearUnreadForUser]
  );

  const markChatAsActive = useCallback(
    (userId: string) => {
      setActiveChatUserIds((prev) => new Set(prev).add(userId));
      clearUnreadForUser(userId);
    },
    [clearUnreadForUser]
  );

  const value: ChatContextType = useMemo(
    () => ({
      isChatOpen,
      toggleChat,
      openChats,
      openChatWith,
      closeChat,
      unreadCounts,
      incrementUnread,
      clearUnreadForUser,
      lastMessages,
      updateLastMessage,
      markChatAsActive,
      activeChatUserIds,
    }),
    [
      isChatOpen,
      toggleChat,
      openChats,
      openChatWith,
      closeChat,
      unreadCounts,
      incrementUnread,
      clearUnreadForUser,
      lastMessages,
      updateLastMessage,
      markChatAsActive,
      activeChatUserIds,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
};
