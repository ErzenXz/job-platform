import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

export function JobList() {
  const jobs = useQuery(api.jobs.getAllJobs);
  const applyForJob = useMutation(api.applications.applyForJob);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async (jobId: Id<"jobs">) => {
    setIsApplying(true);
    try {
      await applyForJob({ jobId, coverLetter: coverLetter || undefined });
      toast.success("Application submitted successfully!");
      setSelectedJob(null);
      setCoverLetter("");
    } catch (error: any) {
      toast.error(error.message || "Failed to apply");
    } finally {
      setIsApplying(false);
    }
  };

  if (!jobs) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Jobs</h2>
        <p className="text-gray-600">{jobs.length} jobs available</p>
      </div>

      <div className="grid gap-6">
        {jobs.map((job) => (
          <div key={job._id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <span className="flex items-center">
                    <span className="mr-1">🏢</span>
                    {job.company?.name}
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">📍</span>
                    {job.location}
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">💼</span>
                    {job.employmentType}
                  </span>
                </div>
                {job.salary && (
                  <div className="text-sm text-green-600 font-medium mb-2">
                    ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} {job.salary.currency}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-2">
                  {job.applicationCount} applications
                </div>
                <button
                  onClick={() => setSelectedJob(job)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply Now
                </button>
              </div>
            </div>

            <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Job Type: {job.jobType.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span>Posted: {new Date(job._creationTime).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Application Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedJob.title}</h3>
                  <p className="text-gray-600">{selectedJob.company?.name}</p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={6}
                  placeholder="Write a brief cover letter explaining why you're interested in this position..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApply(selectedJob._id)}
                  disabled={isApplying}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isApplying ? "Applying..." : "Submit Application"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
