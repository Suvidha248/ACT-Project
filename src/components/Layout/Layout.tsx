import React from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function Layout() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Subtle background elements */}
      <div className="fixed inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="fixed top-20 left-20 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse" />
      <div
        className="fixed bottom-20 right-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header />
        <motion.main
          className="flex-1 overflow-auto relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* This renders nested routes */}
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
