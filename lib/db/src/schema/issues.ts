import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const issuesTable = pgTable("issues", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  priority: text("priority").notNull(),
  status: text("status").notNull().default("open"),
  responsible: text("responsible"),
  dueDate: text("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertIssueSchema = createInsertSchema(issuesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateIssueSchema = insertIssueSchema.partial();

export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type UpdateIssue = z.infer<typeof updateIssueSchema>;
export type Issue = typeof issuesTable.$inferSelect;
