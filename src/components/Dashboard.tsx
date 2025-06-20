import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProfileSetup } from "./ProfileSetup";
import { CompanySetup } from "./CompanySetup";
import { JobSeeker } from "./JobSeeker";
import { CompanyDashboard } from "./CompanyDashboard";

export function Dashboard() {
  const [userType, setUserType] = useState<"jobseeker" | "company" | null>(null);
  const profile = useQuery(api.profiles.getCurrentProfile);
  const company = useQuery(api.companies.getCurrentCompany);

  // Show user type selection if neither profile nor company exists
  if (profile === null && company === null && userType === null) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to JobFinder AI!</h1>
          <p className="text-lg text-gray-600 mb-8">Are you looking for a job or hiring talent?</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setUserType("jobseeker")}
            className="p-8 bg-white rounded-lg shadow-sm border-2 border-transparent hover:border-blue-500 transition-colors"
          >
            <div className="text-4xl mb-4">👤</div>
            <h2 className="text-xl font-semibold mb-2">I'm a Job Seeker</h2>
            <p className="text-gray-600">Find your dream job with AI-powered matching and auto-apply features</p>
          </button>
          
          <button
            onClick={() => setUserType("company")}
            className="p-8 bg-white rounded-lg shadow-sm border-2 border-transparent hover:border-blue-500 transition-colors"
          >
            <div className="text-4xl mb-4">🏢</div>
            <h2 className="text-xl font-semibold mb-2">I'm Hiring</h2>
            <p className="text-gray-600">Post jobs and find the best candidates with AI-scored profiles</p>
          </button>
        </div>
      </div>
    );
  }

  // Show profile setup for job seekers
  if ((userType === "jobseeker" || profile !== null) && profile === null) {
    return <ProfileSetup />;
  }

  // Show company setup for employers
  if ((userType === "company" || company !== null) && company === null) {
    return <CompanySetup />;
  }

  // Show appropriate dashboard based on what exists
  if (profile !== null) {
    return <JobSeeker />;
  }

  if (company !== null) {
    return <CompanyDashboard />;
  }

  return null;
}
