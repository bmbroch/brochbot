import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("scheduledTasks").withIndex("by_nextRun").order("asc").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    schedule: v.string(),
    nextRun: v.number(),
    lastRun: v.optional(v.number()),
    status: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scheduledTasks", args);
  },
});
