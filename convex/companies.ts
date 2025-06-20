import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get current user's company
export const getCurrentCompany = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return company;
  },
});

// Create or update company
export const upsertCompany = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    industry: v.string(),
    size: v.string(),
    location: v.string(),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingCompany = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const companyData = { userId, ...args };

    if (existingCompany) {
      await ctx.db.patch(existingCompany._id, companyData);
      return existingCompany._id;
    } else {
      return await ctx.db.insert("companies", companyData);
    }
  },
});

// Get all companies (for job seekers)
export const getAllCompanies = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("companies").collect();
  },
});

// Get company by ID
export const getCompanyById = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.companyId);
  },
});
