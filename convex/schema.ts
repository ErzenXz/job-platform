import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // User profiles with AI scoring
  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    bio: v.optional(v.string()),
    experience: v.array(v.object({
      company: v.string(),
      position: v.string(),
      duration: v.string(),
      description: v.string(),
    })),
    education: v.array(v.object({
      institution: v.string(),
      degree: v.string(),
      field: v.string(),
      year: v.string(),
    })),
    skills: v.array(v.string()),
    // AI-generated scores for different job types
    aiScores: v.object({
      frontendDeveloper: v.number(),
      backendDeveloper: v.number(),
      fullstackDeveloper: v.number(),
      dataScientist: v.number(),
      devops: v.number(),
      productManager: v.number(),
      designer: v.number(),
      marketing: v.number(),
    }),
    resumeUrl: v.optional(v.string()),
    autoApplyEnabled: v.boolean(),
    autoApplyPreferences: v.object({
      jobTypes: v.array(v.string()),
      minScore: v.number(),
      locations: v.array(v.string()),
    }),
  }).index("by_user", ["userId"]),

  // Company profiles
  companies: defineTable({
    userId: v.id("users"), // Company owner
    name: v.string(),
    description: v.string(),
    industry: v.string(),
    size: v.string(),
    location: v.string(),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Job postings
  jobs: defineTable({
    companyId: v.id("companies"),
    title: v.string(),
    description: v.string(),
    requirements: v.array(v.string()),
    jobType: v.string(), // "frontendDeveloper", "backendDeveloper", etc.
    location: v.string(),
    salary: v.optional(v.object({
      min: v.number(),
      max: v.number(),
      currency: v.string(),
    })),
    employmentType: v.string(), // "full-time", "part-time", "contract"
    isActive: v.boolean(),
    applicationCount: v.number(),
  }).index("by_company", ["companyId"])
    .index("by_job_type", ["jobType"])
    .index("by_active", ["isActive"]),

  // Job applications
  applications: defineTable({
    jobId: v.id("jobs"),
    profileId: v.id("profiles"),
    status: v.string(), // "pending", "reviewed", "accepted", "rejected"
    coverLetter: v.optional(v.string()),
    appliedAt: v.number(),
    isAutoApplied: v.boolean(),
    aiMatchScore: v.number(), // Score calculated when applying
  }).index("by_job", ["jobId"])
    .index("by_profile", ["profileId"])
    .index("by_status", ["status"]),

  // AI job recommendations
  recommendations: defineTable({
    profileId: v.id("profiles"),
    jobId: v.id("jobs"),
    score: v.number(),
    reasons: v.array(v.string()),
    isViewed: v.boolean(),
  }).index("by_profile", ["profileId"])
    .index("by_score", ["score"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
