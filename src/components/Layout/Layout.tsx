import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ChatProvider, useChat } from "../../context/ChatContext";
import ChatSidebar from "../Chat/ChatSidebar";
import ChatWindow from "../Chat/ChatWindow";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

const ChatWindows = () => {
  const { openChats } = useChat();
  const { profile } = useAuth();

  if (!profile?.uid) return null;

  return (
    <div className="fixed bottom-0 right-[288px] flex gap-4 z-50">
      {openChats.map((user) => (
        <ChatWindow key={user.id} currentUserId={profile.uid} chatUser={user} />
      ))}
    </div>
  );
};

export function Layout() {
  return (
    <ChatProvider>
      <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Background grid and pulses */}
        <div className="fixed inset-0 cyber-grid opacity-30 pointer-events-none" />
        <div className="fixed top-20 left-20 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="fixed bottom-20 right-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />

        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden relative z-[1]">
          {/* 🔥 Header must be above everything */}
          <div className="z-[9999] relative">
            <Header />
          </div>

          <motion.main
            className="flex-1 overflow-auto relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Outlet />
          </motion.main>
        </div>

        {/* Chat sidebar and all open chat windows */}
        <ChatSidebar />
        <ChatWindows />
      </div>
    </ChatProvider>
  );
}
