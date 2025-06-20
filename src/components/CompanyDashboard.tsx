import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { JobPostForm } from "./JobPostForm";
import { CompanyJobs } from "./CompanyJobs";
import { CompanyProfile } from "./CompanyProfile";

export function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState<"jobs" | "post" | "profile">("jobs");
  const company = useQuery(api.companies.getCurrentCompany);
  const jobs = useQuery(api.jobs.getMyJobs);

  const tabs = [
    { id: "jobs", label: "My Jobs", icon: "💼" },
    { id: "post", label: "Post Job", icon: "➕" },
    { id: "profile", label: "Company Profile", icon: "🏢" },
  ];

  if (!company) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Active Jobs: {jobs?.filter(job => job.isActive).length || 0}</span>
          <span>Total Applications: {jobs?.reduce((sum, job) => sum + job.applicationCount, 0) || 0}</span>
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
        {activeTab === "jobs" && <CompanyJobs />}
        {activeTab === "post" && <JobPostForm />}
        {activeTab === "profile" && <CompanyProfile />}
      </div>
    </div>
  );
}
