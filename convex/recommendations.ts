import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get recommendations for current user
export const getMyRecommendations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) return [];

    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
      .order("desc")
      .take(20);

    // Get job and company info for each recommendation
    const recommendationsWithDetails = await Promise.all(
      recommendations.map(async (rec) => {
        const job = await ctx.db.get(rec.jobId);
        const company = job ? await ctx.db.get(job.companyId) : null;
        return { ...rec, job, company };
      })
    );

    return recommendationsWithDetails.sort((a, b) => b.score - a.score);
  },
});

// Mark recommendation as viewed
export const markRecommendationViewed = mutation({
  args: { recommendationId: v.id("recommendations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const recommendation = await ctx.db.get(args.recommendationId);
    if (!recommendation) throw new Error("Recommendation not found");

    const profile = await ctx.db.get(recommendation.profileId);
    if (!profile || profile.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.recommendationId, { isViewed: true });
  },
});
