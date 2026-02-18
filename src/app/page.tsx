"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ActivityFeed from "@/components/ActivityFeed";
import CalendarView from "@/components/CalendarView";
import SearchModal from "@/components/SearchModal";

export type View = "feed" | "calendar";

export default function Home() {
  const [view, setView] = useState<View>("feed");
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeView={view} onViewChange={setView} onSearchClick={() => setSearchOpen(true)} />
      <main className="flex-1 ml-64 flex flex-col overflow-hidden">
        <TopBar onSearchClick={() => setSearchOpen(true)} />
        <div className="flex-1 overflow-y-auto">
          {view === "feed" && <ActivityFeed />}
          {view === "calendar" && <CalendarView />}
        </div>
      </main>
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
