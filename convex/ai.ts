import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

// Calculate AI scores for a profile
export const calculateProfileScores = internalAction({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    const profile = await ctx.runQuery(internal.ai.getProfileForScoring, {
      profileId: args.profileId,
    });

    if (!profile) return;

    const prompt = `
Analyze this candidate profile and provide scores (0-100) for different job types based on their experience, education, and skills.

Profile:
Name: ${profile.name}
Bio: ${profile.bio || "Not provided"}

Experience:
${profile.experience.map(exp => `- ${exp.position} at ${exp.company} (${exp.duration}): ${exp.description}`).join('\n')}

Education:
${profile.education.map(edu => `- ${edu.degree} in ${edu.field} from ${edu.institution} (${edu.year})`).join('\n')}

Skills: ${profile.skills.join(', ')}

Please provide scores (0-100) for these job types in JSON format:
{
  "frontendDeveloper": score,
  "backendDeveloper": score,
  "fullstackDeveloper": score,
  "dataScientist": score,
  "devops": score,
  "productManager": score,
  "designer": score,
  "marketing": score
}

Consider:
- Relevant experience and years
- Technical skills alignment
- Education background
- Project complexity
- Leadership experience (for PM roles)
- Creative skills (for design/marketing)

Return only the JSON object.
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("No response from AI");

      const scores = JSON.parse(content);
      
      await ctx.runMutation(internal.ai.updateProfileScores, {
        profileId: args.profileId,
        scores,
      });

      // Generate job recommendations
      await ctx.runAction(internal.ai.generateRecommendations, {
        profileId: args.profileId,
      });

    } catch (error) {
      console.error("Error calculating AI scores:", error);
    }
  },
});

// Get profile for scoring (internal query)
export const getProfileForScoring = internalQuery({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.profileId);
  },
});

// Update profile scores (internal mutation)
export const updateProfileScores = internalMutation({
  args: {
    profileId: v.id("profiles"),
    scores: v.object({
      frontendDeveloper: v.number(),
      backendDeveloper: v.number(),
      fullstackDeveloper: v.number(),
      dataScientist: v.number(),
      devops: v.number(),
      productManager: v.number(),
      designer: v.number(),
      marketing: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, { aiScores: args.scores });
  },
});

// Generate job recommendations
export const generateRecommendations = internalAction({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    const profile = await ctx.runQuery(internal.ai.getProfileForScoring, {
      profileId: args.profileId,
    });

    if (!profile) return;

    const jobs = await ctx.runQuery(internal.ai.getAllActiveJobs, {});

    for (const job of jobs) {
      const jobTypeScore = profile.aiScores[job.jobType as keyof typeof profile.aiScores] || 0;
      
      if (jobTypeScore >= 60) { // Only recommend jobs with good match
        const reasons = [];
        
        if (jobTypeScore >= 80) reasons.push("Excellent skill match");
        else if (jobTypeScore >= 70) reasons.push("Good skill match");
        else reasons.push("Decent skill match");

        // Check location match
        if (profile.location && job.location.toLowerCase().includes(profile.location.toLowerCase())) {
          reasons.push("Location match");
        }

        // Check skill overlap
        const jobRequirements = job.requirements.join(' ').toLowerCase();
        const matchingSkills = profile.skills.filter(skill => 
          jobRequirements.includes(skill.toLowerCase())
        );
        
        if (matchingSkills.length > 0) {
          reasons.push(`Skills match: ${matchingSkills.slice(0, 3).join(', ')}`);
        }

        await ctx.runMutation(internal.ai.createRecommendation, {
          profileId: args.profileId,
          jobId: job._id,
          score: jobTypeScore,
          reasons,
        });
      }
    }
  },
});

// Get all active jobs (internal query)
export const getAllActiveJobs = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

// Create recommendation (internal mutation)
export const createRecommendation = internalMutation({
  args: {
    profileId: v.id("profiles"),
    jobId: v.id("jobs"),
    score: v.number(),
    reasons: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if recommendation already exists
    const existing = await ctx.db
      .query("recommendations")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .filter((q) => q.eq(q.field("jobId"), args.jobId))
      .unique();

    if (!existing) {
      await ctx.db.insert("recommendations", {
        ...args,
        isViewed: false,
      });
    }
  },
});

// Check auto-apply for new job
export const checkAutoApplyForJob = internalAction({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.runQuery(internal.ai.getJobById, { jobId: args.jobId });
    if (!job) return;

    const eligibleProfiles = await ctx.runQuery(internal.ai.getAutoApplyEligibleProfiles, {
      jobType: job.jobType,
      location: job.location,
    });

    for (const profile of eligibleProfiles) {
      const jobTypeScore = profile.aiScores[job.jobType as keyof typeof profile.aiScores] || 0;
      
      if (jobTypeScore >= profile.autoApplyPreferences.minScore) {
        await ctx.runMutation(internal.ai.autoApplyForJob, {
          profileId: profile._id,
          jobId: args.jobId,
          aiMatchScore: jobTypeScore,
        });
      }
    }
  },
});

// Get job by ID (internal query)
export const getJobById = internalQuery({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

// Get profiles eligible for auto-apply
export const getAutoApplyEligibleProfiles = internalQuery({
  args: {
    jobType: v.string(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const profiles = await ctx.db.query("profiles").collect();
    
    return profiles.filter(profile => 
      profile.autoApplyEnabled &&
      profile.autoApplyPreferences.jobTypes.includes(args.jobType) &&
      (profile.autoApplyPreferences.locations.length === 0 || 
       profile.autoApplyPreferences.locations.some(loc => 
         args.location.toLowerCase().includes(loc.toLowerCase())
       ))
    );
  },
});

// Auto-apply for job
export const autoApplyForJob = internalMutation({
  args: {
    profileId: v.id("profiles"),
    jobId: v.id("jobs"),
    aiMatchScore: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if already applied
    const existingApplication = await ctx.db
      .query("applications")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .filter((q) => q.eq(q.field("jobId"), args.jobId))
      .unique();

    if (existingApplication) return;

    const job = await ctx.db.get(args.jobId);
    if (!job || !job.isActive) return;

    await ctx.db.insert("applications", {
      jobId: args.jobId,
      profileId: args.profileId,
      status: "pending",
      appliedAt: Date.now(),
      isAutoApplied: true,
      aiMatchScore: args.aiMatchScore,
    });

    // Update job application count
    await ctx.db.patch(args.jobId, {
      applicationCount: job.applicationCount + 1,
    });
  },
});
