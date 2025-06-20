import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

// Get current user's profile
export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return profile;
  },
});

// Create or update profile
export const upsertProfile = mutation({
  args: {
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
    autoApplyEnabled: v.boolean(),
    autoApplyPreferences: v.object({
      jobTypes: v.array(v.string()),
      minScore: v.number(),
      locations: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const profileData = {
      userId,
      ...args,
      aiScores: existingProfile?.aiScores || {
        frontendDeveloper: 0,
        backendDeveloper: 0,
        fullstackDeveloper: 0,
        dataScientist: 0,
        devops: 0,
        productManager: 0,
        designer: 0,
        marketing: 0,
      },
    };

    let profileId;
    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, profileData);
      profileId = existingProfile._id;
    } else {
      profileId = await ctx.db.insert("profiles", profileData);
    }

    // Schedule AI scoring
    await ctx.scheduler.runAfter(0, internal.ai.calculateProfileScores, {
      profileId,
    });

    return profileId;
  },
});

// Get profile by ID (for companies to view candidates)
export const getProfileById = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.profileId);
  },
});

// Toggle auto-apply feature
export const toggleAutoApply = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, { autoApplyEnabled: args.enabled });
  },
});
