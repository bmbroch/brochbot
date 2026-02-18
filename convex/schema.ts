import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    assignee: v.string(),
    priority: v.string(),
    product: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_assignee", ["assignee"]),

  activities: defineTable({
    agent: v.string(),
    type: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    product: v.optional(v.string()),
    status: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_agent", ["agent"])
    .index("by_type", ["type"])
    .index("by_createdAt", ["createdAt"]),

  scheduledTasks: defineTable({
    name: v.string(),
    schedule: v.string(),
    nextRun: v.optional(v.number()),
    lastRun: v.optional(v.number()),
    agent: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    product: v.optional(v.string()),
  }).index("by_agent", ["agent"]),

  documents: defineTable({
    title: v.string(),
    content: v.string(),
    type: v.string(),
    path: v.string(),
    updatedAt: v.number(),
  }).searchIndex("search_content", {
    searchField: "content",
    filterFields: ["type"],
  }),
});
