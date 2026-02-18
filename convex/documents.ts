import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query) return [];
    const titleResults = await ctx.db
      .query("documents")
      .withSearchIndex("search_title", (q) => q.search("title", args.query))
      .take(10);
    const contentResults = await ctx.db
      .query("documents")
      .withSearchIndex("search_content", (q) => q.search("content", args.query))
      .take(10);
    const seen = new Set<string>();
    const combined = [];
    for (const doc of [...titleResults, ...contentResults]) {
      if (!seen.has(doc._id)) {
        seen.add(doc._id);
        combined.push(doc);
      }
    }
    return combined;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.string(),
    path: v.string(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", args);
  },
});
