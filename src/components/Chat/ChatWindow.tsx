import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { Maximize2, Minus, Send, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../../context/ChatContext";
import { db } from "../../firebase";
import { ChatMessage, User } from "../../types";

interface Props {
  chatUser: User;
  currentUserId: string;
}

const ChatWindow: React.FC<Props> = ({ chatUser, currentUserId }) => {
  const { closeChat, clearUnreadForUser } = useChat();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const chatId = [currentUserId, chatUser.id].sort().join("_");

  // ✅ Mark as read helper
  const markAsRead = async () => {
    try {
      if (!currentUserId || !chatUser.id) return;

      const readRef = doc(
        db,
        "chatReadTimestamps",
        currentUserId,
        "with",
        chatUser.id
      );
      await setDoc(readRef, { lastRead: serverTimestamp() }, { merge: true });

      console.log(
        "✅ lastRead timestamp saved:",
        currentUserId,
        "→",
        chatUser.id
      );
      clearUnreadForUser(chatUser.id);
    } catch (error) {
      console.error("❌ Failed to save lastRead timestamp:", error);
    }
  };

  // 🔁 Real-time messages listener
  useEffect(() => {
    const q = query(
      collection(db, "messages", chatId, "chats"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => doc.data() as ChatMessage);
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [chatId]);

  // 🧹 Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Mark as read on chat open
  useEffect(() => {
    if (chatUser.id && currentUserId) {
      markAsRead();
    }
  }, [chatUser.id, currentUserId]);

  // ✅ Mark as read if receiving new message from someone else
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.senderId !== currentUserId) {
      markAsRead();
    }
  }, [messages, currentUserId, chatUser.id]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    const timestamp = serverTimestamp() as Timestamp;

    const messagePayload: ChatMessage = {
      chatId,
      senderId: currentUserId,
      text: newMsg,
      participants: [currentUserId, chatUser.id],
      timestamp,
    };

    try {
      await addDoc(collection(db, "messages", chatId, "chats"), messagePayload);

      await Promise.all([
        setDoc(
          doc(db, "chatSummaries", currentUserId, "with", chatUser.id),
          {
            partnerId: chatUser.id,
            lastMessage: newMsg,
            lastSenderId: currentUserId,
            timestamp,
          },
          { merge: true }
        ),
        setDoc(
          doc(db, "chatSummaries", chatUser.id, "with", currentUserId),
          {
            partnerId: currentUserId,
            lastMessage: newMsg,
            lastSenderId: currentUserId,
            timestamp,
          },
          { merge: true }
        ),
      ]);

      setNewMsg("");
    } catch (err) {
      console.error("❌ Error sending message:", err);
    }
  };

  if (isMinimized) {
    return (
      <div className="w-[300px] h-10 bg-slate-800 border border-slate-600 rounded-t-md shadow-md flex justify-between items-center px-2 text-sm">
        <span className="text-white font-mono">{chatUser.fullName}</span>
        <div className="flex space-x-2">
          <Maximize2
            size={14}
            className="text-white cursor-pointer"
            onClick={() => setIsMinimized(false)}
          />
          <X
            size={14}
            className="text-white cursor-pointer"
            onClick={() => closeChat(chatUser.id)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-[300px] h-96 bg-slate-800 border border-slate-600 rounded-t-md shadow-md overflow-hidden flex flex-col">
      <div className="bg-slate-900 px-3 py-2 text-sm font-mono text-slate-300 border-b border-slate-600 flex justify-between items-center">
        <span>
          Chat with <span className="text-teal-400">{chatUser.fullName}</span>
        </span>
        <div className="space-x-2">
          <Minus
            className="inline text-slate-400 cursor-pointer"
            size={14}
            onClick={() => setIsMinimized(true)}
          />
          <X
            className="inline text-red-400 cursor-pointer"
            size={14}
            onClick={() => closeChat(chatUser.id)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 flex flex-col">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`px-3 py-1 text-xs rounded-md font-mono break-words max-w-[80%] ${
              msg.senderId === currentUserId
                ? "bg-emerald-600 text-white self-end"
                : "bg-slate-600 text-white self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex px-2 py-1 border-t border-slate-600 bg-slate-700">
        <input
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-transparent text-sm text-slate-200 outline-none font-mono"
          placeholder="Type your message..."
        />
        <button onClick={handleSend} className="ml-2 text-teal-400">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
