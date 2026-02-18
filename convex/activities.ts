import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    type: v.optional(v.string()),
    product: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    let q;
    if (args.type) {
      q = ctx.db.query("activities").withIndex("by_type", (q) => q.eq("type", args.type!));
    } else if (args.product) {
      q = ctx.db.query("activities").withIndex("by_product", (q) => q.eq("product", args.product!));
    } else {
      q = ctx.db.query("activities").withIndex("by_timestamp");
    }
    return await q.order("desc").take(limit);
  },
});

export const create = mutation({
  args: {
    timestamp: v.number(),
    type: v.string(),
    title: v.string(),
    description: v.string(),
    product: v.string(),
    status: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", args);
  },
});
