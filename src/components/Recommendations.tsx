import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

export function Recommendations() {
  const recommendations = useQuery(api.recommendations.getMyRecommendations);
  const applyForJob = useMutation(api.applications.applyForJob);
  const markViewed = useMutation(api.recommendations.markRecommendationViewed);
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

  const handleViewRecommendation = async (recommendation: any) => {
    if (!recommendation.isViewed) {
      await markViewed({ recommendationId: recommendation._id });
    }
    setSelectedJob(recommendation.job);
  };

  if (!recommendations) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 70) return "text-blue-600 bg-blue-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Job Recommendations</h2>
        <p className="text-gray-600">Jobs matched to your profile using AI analysis</p>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
          <p className="text-gray-600">Complete your profile to get AI-powered job recommendations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div 
              key={rec._id} 
              className={`bg-white rounded-lg shadow-sm border p-6 cursor-pointer hover:shadow-md transition-shadow ${
                !rec.isViewed ? "ring-2 ring-blue-200" : ""
              }`}
              onClick={() => handleViewRecommendation(rec)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {rec.job?.title}
                    </h3>
                    {!rec.isViewed && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{rec.company?.name}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      <span className="mr-1">📍</span>
                      {rec.job?.location}
                    </span>
                    <span className="flex items-center">
                      <span className="mr-1">💼</span>
                      {rec.job?.employmentType}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {rec.reasons.map((reason, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(rec.score)}`}>
                    {rec.score}% Match
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedJob(rec.job);
                    }}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Apply Now
                  </button>
                </div>
              </div>

              <p className="text-gray-700 text-sm line-clamp-2">{rec.job?.description}</p>
            </div>
          ))}
        </div>
      )}

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

              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Job Details:</h4>
                <p className="text-blue-800 text-sm mb-2">{selectedJob.description}</p>
                <div className="text-sm text-blue-700">
                  <strong>Requirements:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {selectedJob.requirements?.map((req: string, index: number) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
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
