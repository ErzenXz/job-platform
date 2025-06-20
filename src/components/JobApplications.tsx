import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

import { Id } from "../../convex/_generated/dataModel";

interface JobApplicationsProps {
  jobId: Id<"jobs">;
}

export function JobApplications({ jobId }: JobApplicationsProps) {
  const applications = useQuery(api.applications.getJobApplications, { jobId });
  const updateStatus = useMutation(api.applications.updateApplicationStatus);
  const job = useQuery(api.jobs.getJobById, { jobId });
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const handleStatusUpdate = async (applicationId: Id<"applications">, status: string) => {
    try {
      await updateStatus({ applicationId, status });
      toast.success(`Application ${status}`);
    } catch (error) {
      toast.error("Failed to update application status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "reviewed": return "bg-blue-100 text-blue-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 70) return "text-blue-600 bg-blue-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  if (!applications || !job) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Applications for {job.title}</h2>
        <p className="text-gray-600">{applications.length} applications received</p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-600">Applications will appear here when candidates apply</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application._id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.profile?.name}
                    </h3>
                    {application.isAutoApplied && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        Auto Applied
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{application.profile?.email}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span>Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                    {application.profile?.location && (
                      <span className="flex items-center">
                        <span className="mr-1">📍</span>
                        {application.profile.location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-bold mb-3 ${getScoreColor(application.aiMatchScore)}`}>
                    {application.aiMatchScore}% Match
                  </div>
                  <div className="flex flex-col space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                    <button
                      onClick={() => setSelectedProfile(application.profile)}
                      className="px-3 py-1 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-sm"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>

              {application.coverLetter && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Cover Letter:</h4>
                  <p className="text-gray-700 text-sm">{application.coverLetter}</p>
                </div>
              )}

              {application.status === "pending" && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusUpdate(application._id, "reviewed")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Mark as Reviewed
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(application._id, "accepted")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(application._id, "rejected")}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Profile Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">{selectedProfile.name}</h3>
                  <p className="text-gray-600">{selectedProfile.email}</p>
                  {selectedProfile.location && (
                    <p className="text-gray-600 flex items-center mt-1">
                      <span className="mr-1">📍</span>
                      {selectedProfile.location}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* AI Scores */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">AI Job Type Scores</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(selectedProfile.aiScores).map(([jobType, score]) => (
                    <div key={jobType} className="text-center">
                      <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${getScoreColor(score as number)}`}>
                        {score as number}
                      </div>
                      <p className="mt-1 text-xs text-gray-600">{jobType.replace(/([A-Z])/g, ' $1').trim()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bio */}
              {selectedProfile.bio && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Bio</h4>
                  <p className="text-gray-700">{selectedProfile.bio}</p>
                </div>
              )}

              {/* Experience */}
              {selectedProfile.experience.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Experience</h4>
                  <div className="space-y-3">
                    {selectedProfile.experience.map((exp: any, index: number) => (
                      <div key={index} className="border-l-4 border-blue-200 pl-4">
                        <h5 className="font-medium text-gray-900">{exp.position}</h5>
                        <p className="text-blue-600 text-sm">{exp.company}</p>
                        <p className="text-xs text-gray-500 mb-1">{exp.duration}</p>
                        <p className="text-gray-700 text-sm">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {selectedProfile.education.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Education</h4>
                  <div className="space-y-3">
                    {selectedProfile.education.map((edu: any, index: number) => (
                      <div key={index} className="border-l-4 border-green-200 pl-4">
                        <h5 className="font-medium text-gray-900">{edu.degree} in {edu.field}</h5>
                        <p className="text-green-600 text-sm">{edu.institution}</p>
                        <p className="text-xs text-gray-500">{edu.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {selectedProfile.skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.skills.map((skill: string, index: number) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
