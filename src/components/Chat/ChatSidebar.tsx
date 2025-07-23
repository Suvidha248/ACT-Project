import React, { useEffect, useState } from "react";
import { useChat } from "../../context/ChatContext";
import { getAllUsers } from "../../services/userService";
import { User } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { User as UserIcon, Search } from "lucide-react";
import { db } from "../../firebase";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";

const ChatSidebar: React.FC = () => {
  const {
    isChatOpen,
    toggleChat,
    openChatWith,
    openChats,
    unreadCounts,
    incrementUnread,
    clearUnreadForUser,
    lastMessages,
    updateLastMessage,
  } = useChat();

  const { profile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  // Fetch all users
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getAllUsers();
        const filtered = data.filter(
          (u) => u?.id && u.name && u.id !== profile?.uid
        );
        setUsers(filtered);
      } catch (error) {
        console.error("❌ Failed to fetch chat users:", error);
      }
    };
    fetch();
  }, [profile?.uid]);

  // Listen to chat summaries and check for unread
  useEffect(() => {
    if (!profile?.uid) return;

    const unsubscribe = onSnapshot(
      collection(db, "chatSummaries", profile.uid, "with"),
      (snapshot) => {
        const seenPartners = new Set<string>();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const partnerId = data.partnerId;
          const lastMsg = data.lastMessage;
          const lastSenderId = data.lastSenderId;
          const lastMsgTimestamp = data.timestamp?.toMillis?.() ?? 0;

          if (!partnerId || !lastMsg) return;

          seenPartners.add(partnerId);
          updateLastMessage(partnerId, lastMsg);

          const isChatOpenWithUser = openChats.some((u) => u.id === partnerId);

          const readRef = doc(
            db,
            "chatReadTimestamps",
            profile.uid,
            "with",
            partnerId
          );

          getDoc(readRef).then((readSnap) => {
            const lastRead = readSnap.exists()
              ? readSnap.data().lastRead?.toMillis?.() ?? 0
              : 0;

            // ✅ Skip unread logic for my own messages
            if (lastSenderId === profile.uid) {
              clearUnreadForUser(partnerId);
              return;
            }

            // ✅ Mark unread only if message came after last read
            const isUnread = lastMsgTimestamp > lastRead;

            if (isUnread && !isChatOpenWithUser) {
              incrementUnread(partnerId);
            } else {
              clearUnreadForUser(partnerId);
            }
          });
        });

        // Cleanup: remove users with deleted summaries
        setUsers((prevUsers) =>
          prevUsers.filter(
            (u) => seenPartners.has(u.id) || u.id !== profile?.uid
          )
        );
      }
    );

    return () => unsubscribe();
  }, [
    profile?.uid,
    openChats,
    updateLastMessage,
    incrementUnread,
    clearUnreadForUser,
  ]);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  const unreadTotal = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <div
      className={`fixed bottom-0 right-0 z-50 bg-slate-900 text-slate-300 ${
        isChatOpen ? "h-[500px]" : "h-12"
      } w-72 transition-all duration-300 rounded-t-lg border border-slate-700`}
    >
      {/* Chat Toggle Bar */}
      <div
        className="flex justify-between items-center px-4 py-2 bg-slate-800 cursor-pointer border-b border-slate-700 relative"
        onClick={toggleChat}
      >
        <span className="font-mono text-xs">Chat</span>
        <span className="text-teal-400 text-xs">{isChatOpen ? "▼" : "▲"}</span>

        {unreadTotal > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-400 to-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {unreadTotal}
          </span>
        )}
      </div>

      {isChatOpen && (
        <div className="flex flex-col h-full">
          {/* Current User Info */}
          <div className="flex items-center space-x-2 px-4 py-2 border-b border-slate-700">
            <UserIcon className="w-4 h-4 text-green-400" />
            <span className="font-mono text-xs">
              {profile?.fullName || "You"}
            </span>
            <span className="text-green-400 text-xs ml-auto">Available</span>
          </div>

          {/* Search */}
          <div className="flex items-center px-2 py-1 bg-slate-800 border-b border-slate-700">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-xs font-mono text-slate-300 w-full"
              placeholder="Search Contacts, Chats..."
            />
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredUsers.map((user) => {
              const unread = unreadCounts[user.id] || 0;
              const lastMsg = lastMessages[user.id] || "No messages yet.";

              return (
                <div
                  key={user.id}
                  className={`flex items-center space-x-2 px-2 py-1 rounded relative cursor-pointer ${
                    unread > 0
                      ? "bg-slate-800 hover:bg-slate-700"
                      : "hover:bg-slate-700"
                  }`}
                  onClick={() => openChatWith(user)}
                >
                  <UserIcon className="w-4 h-4 text-teal-400" />
                  <div className="flex flex-col">
                    <span className="font-mono text-xs">{user.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                      {lastMsg}
                    </span>
                  </div>

                  {unread > 0 && (
                    <div className="absolute top-1 right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold">
                      {unread}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;
