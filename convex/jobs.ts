import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Get all active jobs
export const getAllJobs = query({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Get company info for each job
    const jobsWithCompanies = await Promise.all(
      jobs.map(async (job) => {
        const company = await ctx.db.get(job.companyId);
        return { ...job, company };
      })
    );

    return jobsWithCompanies;
  },
});

// Get jobs by company
export const getJobsByCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();
  },
});

// Get current user's company jobs
export const getMyJobs = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!company) return [];

    return await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .collect();
  },
});

// Create job posting
export const createJob = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    requirements: v.array(v.string()),
    jobType: v.string(),
    location: v.string(),
    salary: v.optional(v.object({
      min: v.number(),
      max: v.number(),
      currency: v.string(),
    })),
    employmentType: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!company) throw new Error("Company profile required");

    const jobId = await ctx.db.insert("jobs", {
      companyId: company._id,
      ...args,
      isActive: true,
      applicationCount: 0,
    });

    // Schedule auto-apply check for eligible candidates
    await ctx.scheduler.runAfter(0, internal.ai.checkAutoApplyForJob, {
      jobId,
    });

    return jobId;
  },
});

// Update job
export const updateJob = mutation({
  args: {
    jobId: v.id("jobs"),
    title: v.string(),
    description: v.string(),
    requirements: v.array(v.string()),
    jobType: v.string(),
    location: v.string(),
    salary: v.optional(v.object({
      min: v.number(),
      max: v.number(),
      currency: v.string(),
    })),
    employmentType: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    const company = await ctx.db.get(job.companyId);
    if (!company || company.userId !== userId) {
      throw new Error("Not authorized");
    }

    const { jobId, ...updateData } = args;
    await ctx.db.patch(jobId, updateData);
  },
});

// Get job by ID
export const getJobById = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return null;

    const company = await ctx.db.get(job.companyId);
    return { ...job, company };
  },
});
