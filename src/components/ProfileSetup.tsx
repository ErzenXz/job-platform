import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ProfileSetup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    experience: [{ company: "", position: "", duration: "", description: "" }],
    education: [{ institution: "", degree: "", field: "", year: "" }],
    skills: [""],
    autoApplyEnabled: false,
    autoApplyPreferences: {
      jobTypes: [] as string[],
      minScore: 70,
      locations: [""],
    },
  });

  const upsertProfile = useMutation(api.profiles.upsertProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jobTypes = [
    "frontendDeveloper",
    "backendDeveloper", 
    "fullstackDeveloper",
    "dataScientist",
    "devops",
    "productManager",
    "designer",
    "marketing"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter out empty entries
      const cleanedData = {
        ...formData,
        experience: formData.experience.filter(exp => exp.company && exp.position),
        education: formData.education.filter(edu => edu.institution && edu.degree),
        skills: formData.skills.filter(skill => skill.trim()),
        autoApplyPreferences: {
          ...formData.autoApplyPreferences,
          locations: formData.autoApplyPreferences.locations.filter(loc => loc.trim()),
        },
      };

      await upsertProfile(cleanedData);
      toast.success("Profile created! AI is calculating your job scores...");
    } catch (error) {
      toast.error("Failed to create profile");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { company: "", position: "", duration: "", description: "" }],
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { institution: "", degree: "", field: "", year: "" }],
    });
  };

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, ""],
    });
  };

  const addLocation = () => {
    setFormData({
      ...formData,
      autoApplyPreferences: {
        ...formData.autoApplyPreferences,
        locations: [...formData.autoApplyPreferences.locations, ""],
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Your Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <textarea
              placeholder="Bio / Professional Summary"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-4"
              rows={3}
            />
          </div>

          {/* Experience */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Experience</h2>
            {formData.experience.map((exp, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                <input
                  type="text"
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) => {
                    const newExp = [...formData.experience];
                    newExp[index].company = e.target.value;
                    setFormData({ ...formData, experience: newExp });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Position"
                  value={exp.position}
                  onChange={(e) => {
                    const newExp = [...formData.experience];
                    newExp[index].position = e.target.value;
                    setFormData({ ...formData, experience: newExp });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Duration (e.g., 2020-2023)"
                  value={exp.duration}
                  onChange={(e) => {
                    const newExp = [...formData.experience];
                    newExp[index].duration = e.target.value;
                    setFormData({ ...formData, experience: newExp });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  placeholder="Description"
                  value={exp.description}
                  onChange={(e) => {
                    const newExp = [...formData.experience];
                    newExp[index].description = e.target.value;
                    setFormData({ ...formData, experience: newExp });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addExperience}
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
            >
              Add Experience
            </button>
          </div>

          {/* Education */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Education</h2>
            {formData.education.map((edu, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                <input
                  type="text"
                  placeholder="Institution"
                  value={edu.institution}
                  onChange={(e) => {
                    const newEdu = [...formData.education];
                    newEdu[index].institution = e.target.value;
                    setFormData({ ...formData, education: newEdu });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) => {
                    const newEdu = [...formData.education];
                    newEdu[index].degree = e.target.value;
                    setFormData({ ...formData, education: newEdu });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Field of Study"
                  value={edu.field}
                  onChange={(e) => {
                    const newEdu = [...formData.education];
                    newEdu[index].field = e.target.value;
                    setFormData({ ...formData, education: newEdu });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Year"
                  value={edu.year}
                  onChange={(e) => {
                    const newEdu = [...formData.education];
                    newEdu[index].year = e.target.value;
                    setFormData({ ...formData, education: newEdu });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addEducation}
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
            >
              Add Education
            </button>
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formData.skills.map((skill, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder="Skill"
                  value={skill}
                  onChange={(e) => {
                    const newSkills = [...formData.skills];
                    newSkills[index] = e.target.value;
                    setFormData({ ...formData, skills: newSkills });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 mt-4"
            >
              Add Skill
            </button>
          </div>

          {/* Auto Apply Settings */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Auto Apply Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.autoApplyEnabled}
                  onChange={(e) => setFormData({ ...formData, autoApplyEnabled: e.target.checked })}
                  className="mr-2"
                />
                Enable Auto Apply
              </label>

              {formData.autoApplyEnabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Job Types to Auto Apply</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {jobTypes.map((type) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.autoApplyPreferences.jobTypes.includes(type)}
                            onChange={(e) => {
                              const newTypes = e.target.checked
                                ? [...formData.autoApplyPreferences.jobTypes, type]
                                : formData.autoApplyPreferences.jobTypes.filter(t => t !== type);
                              setFormData({
                                ...formData,
                                autoApplyPreferences: {
                                  ...formData.autoApplyPreferences,
                                  jobTypes: newTypes,
                                },
                              });
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Minimum Score for Auto Apply: {formData.autoApplyPreferences.minScore}
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="90"
                      value={formData.autoApplyPreferences.minScore}
                      onChange={(e) => setFormData({
                        ...formData,
                        autoApplyPreferences: {
                          ...formData.autoApplyPreferences,
                          minScore: parseInt(e.target.value),
                        },
                      })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Locations</label>
                    {formData.autoApplyPreferences.locations.map((location, index) => (
                      <input
                        key={index}
                        type="text"
                        placeholder="Location"
                        value={location}
                        onChange={(e) => {
                          const newLocations = [...formData.autoApplyPreferences.locations];
                          newLocations[index] = e.target.value;
                          setFormData({
                            ...formData,
                            autoApplyPreferences: {
                              ...formData.autoApplyPreferences,
                              locations: newLocations,
                            },
                          });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                      />
                    ))}
                    <button
                      type="button"
                      onClick={addLocation}
                      className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      Add Location
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating Profile..." : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
