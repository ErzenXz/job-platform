import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { JobList } from "./JobList";
import { Applications } from "./Applications";
import { Recommendations } from "./Recommendations";
import { ProfileView } from "./ProfileView";

export function JobSeeker() {
  const [activeTab, setActiveTab] = useState<"jobs" | "recommendations" | "applications" | "profile">("recommendations");
  const profile = useQuery(api.profiles.getCurrentProfile);

  const tabs = [
    { id: "recommendations", label: "AI Recommendations", icon: "🎯" },
    { id: "jobs", label: "All Jobs", icon: "💼" },
    { id: "applications", label: "My Applications", icon: "📝" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {profile.name}!</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Auto Apply: {profile.autoApplyEnabled ? "✅ Enabled" : "❌ Disabled"}</span>
          <span>Profile Score: {Math.max(...Object.values(profile.aiScores))}/100</span>
        </div>
      </div>

      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "recommendations" && <Recommendations />}
        {activeTab === "jobs" && <JobList />}
        {activeTab === "applications" && <Applications />}
        {activeTab === "profile" && <ProfileView />}
      </div>
    </div>
  );
}
