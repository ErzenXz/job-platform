import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { JobApplications } from "./JobApplications";

export function CompanyJobs() {
  const jobs = useQuery(api.jobs.getMyJobs);
  const [selectedJobId, setSelectedJobId] = useState<Id<"jobs"> | null>(null);

  if (!jobs) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedJobId) {
    return (
      <div>
        <button
          onClick={() => setSelectedJobId(null)}
          className="mb-4 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
        >
          ← Back to Jobs
        </button>
        <JobApplications jobId={selectedJobId} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Job Postings</h2>
        <p className="text-gray-600">{jobs.length} jobs posted</p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">💼</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
          <p className="text-gray-600">Create your first job posting to start finding candidates</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {job.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center">
                      <span className="mr-1">📍</span>
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <span className="mr-1">💼</span>
                      {job.employmentType}
                    </span>
                    <span className="flex items-center">
                      <span className="mr-1">🏷️</span>
                      {job.jobType.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  {job.salary && (
                    <div className="text-sm text-green-600 font-medium mb-3">
                      ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} {job.salary.currency}
                    </div>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {job.applicationCount}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">Applications</div>
                  <button
                    onClick={() => setSelectedJobId(job._id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    View Applications
                  </button>
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {job.requirements.slice(0, 3).map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                  {job.requirements.length > 3 && (
                    <li className="text-gray-500">+{job.requirements.length - 3} more...</li>
                  )}
                </ul>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Posted: {new Date(job._creationTime).toLocaleDateString()}</span>
                <span>Job ID: {job._id.slice(-8)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
