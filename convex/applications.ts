import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Apply for a job
export const applyForJob = mutation({
  args: {
    jobId: v.id("jobs"),
    coverLetter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile required to apply");

    // Check if already applied
    const existingApplication = await ctx.db
      .query("applications")
      .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
      .filter((q) => q.eq(q.field("jobId"), args.jobId))
      .unique();

    if (existingApplication) {
      throw new Error("Already applied for this job");
    }

    const job = await ctx.db.get(args.jobId);
    if (!job || !job.isActive) {
      throw new Error("Job not available");
    }

    // Calculate AI match score
    const jobTypeScore = profile.aiScores[job.jobType as keyof typeof profile.aiScores] || 0;

    const applicationId = await ctx.db.insert("applications", {
      jobId: args.jobId,
      profileId: profile._id,
      status: "pending",
      coverLetter: args.coverLetter,
      appliedAt: Date.now(),
      isAutoApplied: false,
      aiMatchScore: jobTypeScore,
    });

    // Update job application count
    await ctx.db.patch(args.jobId, {
      applicationCount: job.applicationCount + 1,
    });

    return applicationId;
  },
});

// Get user's applications
export const getMyApplications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) return [];

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
      .collect();

    // Get job and company info for each application
    const applicationsWithDetails = await Promise.all(
      applications.map(async (app) => {
        const job = await ctx.db.get(app.jobId);
        const company = job ? await ctx.db.get(job.companyId) : null;
        return { ...app, job, company };
      })
    );

    return applicationsWithDetails;
  },
});

// Get applications for a job (for companies)
export const getJobApplications = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    const company = await ctx.db.get(job.companyId);
    if (!company || company.userId !== userId) {
      throw new Error("Not authorized");
    }

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect();

    // Get profile info for each application
    const applicationsWithProfiles = await Promise.all(
      applications.map(async (app) => {
        const profile = await ctx.db.get(app.profileId);
        return { ...app, profile };
      })
    );

    return applicationsWithProfiles.sort((a, b) => b.aiMatchScore - a.aiMatchScore);
  },
});

// Update application status
export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found");

    const job = await ctx.db.get(application.jobId);
    if (!job) throw new Error("Job not found");

    const company = await ctx.db.get(job.companyId);
    if (!company || company.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.applicationId, { status: args.status });
  },
});
