import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  activities: defineTable({
    timestamp: v.number(),
    type: v.string(),
    title: v.string(),
    description: v.string(),
    product: v.string(),
    status: v.string(),
    metadata: v.optional(v.any()),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_type", ["type", "timestamp"])
    .index("by_product", ["product", "timestamp"]),

  scheduledTasks: defineTable({
    name: v.string(),
    schedule: v.string(),
    nextRun: v.number(),
    lastRun: v.optional(v.number()),
    status: v.string(),
    description: v.string(),
  }).index("by_nextRun", ["nextRun"]),

  documents: defineTable({
    title: v.string(),
    content: v.string(),
    type: v.string(),
    path: v.string(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .searchIndex("search_title", { searchField: "title" })
    .searchIndex("search_content", { searchField: "content" }),
});
