"use client";

import { useState, type ReactNode } from "react";
import { FileText, Inbox, UsersRound, Settings } from "lucide-react";

type TabId = "members" | "news" | "contacts" | "content";

type AdminTabsProps = {
  members: ReactNode;
  news: ReactNode;
  contacts: ReactNode;
  content: ReactNode;
};

const tabs: Array<{ id: TabId; label: string; icon: ReactNode }> = [
  { id: "members", label: "Miembros", icon: <UsersRound size={17} /> },
  { id: "news", label: "Blog jurídico", icon: <FileText size={17} /> },
  { id: "contacts", label: "Solicitudes de contacto", icon: <Inbox size={17} /> },
  { id: "content", label: "Contenido del sitio", icon: <Settings size={17} /> },
];

export function AdminTabs({ members, news, contacts, content }: AdminTabsProps) {
  const [active, setActive] = useState<TabId>("members");

  const panels: Record<TabId, ReactNode> = {
    members,
    news,
    contacts,
    content,
  };

  return (
    <div className="admin-tabs">
      <div className="admin-tab-list" role="tablist" aria-label="Secciones del panel">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={active === tab.id ? "admin-tab active" : "admin-tab"}
            onClick={() => setActive(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="admin-tab-panel" role="tabpanel">
        {panels[active]}
      </div>
    </div>
  );
}
