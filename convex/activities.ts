import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("activities").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    agent: v.string(),
    type: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    product: v.optional(v.string()),
    status: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", { ...args, createdAt: Date.now() });
  },
});
