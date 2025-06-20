import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ProfileView() {
  const profile = useQuery(api.profiles.getCurrentProfile);
  const toggleAutoApply = useMutation(api.profiles.toggleAutoApply);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleAutoApply = async () => {
    if (!profile) return;
    
    setIsToggling(true);
    try {
      await toggleAutoApply({ enabled: !profile.autoApplyEnabled });
      toast.success(`Auto Apply ${!profile.autoApplyEnabled ? "enabled" : "disabled"}`);
    } catch (error) {
      toast.error("Failed to update auto apply setting");
    } finally {
      setIsToggling(false);
    }
  };

  if (!profile) {
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

  const formatJobType = (jobType: string) => {
    return jobType.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h2>
            <p className="text-gray-600 mb-2">{profile.email}</p>
            {profile.location && (
              <p className="text-gray-600 flex items-center">
                <span className="mr-1">📍</span>
                {profile.location}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-2">Auto Apply Status</div>
            <button
              onClick={handleToggleAutoApply}
              disabled={isToggling}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                profile.autoApplyEnabled
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              } disabled:opacity-50`}
            >
              {isToggling ? "Updating..." : profile.autoApplyEnabled ? "✅ Enabled" : "❌ Disabled"}
            </button>
          </div>
        </div>

        {profile.bio && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Bio</h3>
            <p className="text-gray-700">{profile.bio}</p>
          </div>
        )}
      </div>

      {/* AI Scores */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Job Type Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(profile.aiScores).map(([jobType, score]) => (
            <div key={jobType} className="text-center">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900">{formatJobType(jobType)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>💡 These scores are calculated by AI based on your experience, education, and skills.</p>
        </div>
      </div>

      {/* Experience */}
      {profile.experience.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Experience</h3>
          <div className="space-y-4">
            {profile.experience.map((exp, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-4">
                <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                <p className="text-blue-600 font-medium">{exp.company}</p>
                <p className="text-sm text-gray-500 mb-2">{exp.duration}</p>
                <p className="text-gray-700 text-sm">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {profile.education.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Education</h3>
          <div className="space-y-4">
            {profile.education.map((edu, index) => (
              <div key={index} className="border-l-4 border-green-200 pl-4">
                <h4 className="font-semibold text-gray-900">{edu.degree} in {edu.field}</h4>
                <p className="text-green-600 font-medium">{edu.institution}</p>
                <p className="text-sm text-gray-500">{edu.year}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {profile.skills.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <span 
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Auto Apply Preferences */}
      {profile.autoApplyEnabled && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Auto Apply Preferences</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Job Types</h4>
              <div className="flex flex-wrap gap-2">
                {profile.autoApplyPreferences.jobTypes.map((type, index) => (
                  <span 
                    key={index}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                  >
                    {formatJobType(type)}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Minimum Score</h4>
              <p className="text-gray-700">{profile.autoApplyPreferences.minScore}/100</p>
            </div>
            {profile.autoApplyPreferences.locations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Preferred Locations</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.autoApplyPreferences.locations.map((location, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
