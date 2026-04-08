import { Router, Request, Response } from "express";
import { db, issuesTable } from "@workspace/db";
import { eq, sql, and, gte, lte } from "drizzle-orm";

const router = Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const { status, category, priority } = req.query;
  const conditions = [];
  if (status && typeof status === "string") conditions.push(eq(issuesTable.status, status));
  if (category && typeof category === "string") conditions.push(eq(issuesTable.category, category));
  if (priority && typeof priority === "string") conditions.push(eq(issuesTable.priority, priority));

  const issues = conditions.length > 0
    ? await db.select().from(issuesTable).where(and(...conditions)).orderBy(issuesTable.createdAt)
    : await db.select().from(issuesTable).orderBy(issuesTable.createdAt);

  const mapped = issues.map(i => ({
    ...i,
    dueDate: i.dueDate ?? null,
    description: i.description ?? null,
    responsible: i.responsible ?? null,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  }));

  res.json(mapped);
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { title, description, category, priority, status, responsible, dueDate } = req.body;
  const [issue] = await db.insert(issuesTable).values({
    title,
    description: description ?? null,
    category,
    priority,
    status: status ?? "open",
    responsible: responsible ?? null,
    dueDate: dueDate ?? null,
  }).returning();

  res.status(201).json({
    ...issue,
    createdAt: issue.createdAt.toISOString(),
    updatedAt: issue.updatedAt.toISOString(),
    description: issue.description ?? null,
    responsible: issue.responsible ?? null,
    dueDate: issue.dueDate ?? null,
  });
});

router.get("/stats", async (_req: Request, res: Response): Promise<void> => {
  const rows = await db.select({
    status: issuesTable.status,
    priority: issuesTable.priority,
    count: sql<number>`count(*)::int`,
  }).from(issuesTable).groupBy(issuesTable.status, issuesTable.priority);

  let total = 0, open = 0, inProgress = 0, resolved = 0, critical = 0;
  for (const row of rows) {
    total += row.count;
    if (row.status === "open") open += row.count;
    if (row.status === "in_progress") inProgress += row.count;
    if (row.status === "resolved") resolved += row.count;
    if (row.priority === "critical") critical += row.count;
  }

  res.json({ total, open, inProgress, resolved, critical });
});

router.get("/by-category", async (_req: Request, res: Response): Promise<void> => {
  const rows = await db.select({
    category: issuesTable.category,
    status: issuesTable.status,
    count: sql<number>`count(*)::int`,
  }).from(issuesTable).groupBy(issuesTable.category, issuesTable.status);

  const map: Record<string, { category: string; count: number; open: number; resolved: number }> = {};
  for (const row of rows) {
    if (!map[row.category]) map[row.category] = { category: row.category, count: 0, open: 0, resolved: 0 };
    map[row.category].count += row.count;
    if (row.status === "open") map[row.category].open += row.count;
    if (row.status === "resolved") map[row.category].resolved += row.count;
  }
  res.json(Object.values(map));
});

router.get("/by-priority", async (_req: Request, res: Response): Promise<void> => {
  const rows = await db.select({
    priority: issuesTable.priority,
    count: sql<number>`count(*)::int`,
  }).from(issuesTable).groupBy(issuesTable.priority);
  res.json(rows);
});

router.get("/trend", async (_req: Request, res: Response): Promise<void> => {
  const created = await db.select({
    date: sql<string>`date_trunc('day', created_at)::date::text`,
    count: sql<number>`count(*)::int`,
  }).from(issuesTable).groupBy(sql`date_trunc('day', created_at)`);

  const resolved = await db.select({
    date: sql<string>`date_trunc('day', updated_at)::date::text`,
    count: sql<number>`count(*)::int`,
  }).from(issuesTable).where(eq(issuesTable.status, "resolved")).groupBy(sql`date_trunc('day', updated_at)`);

  const createdMap: Record<string, number> = {};
  const resolvedMap: Record<string, number> = {};
  for (const r of created) createdMap[r.date] = r.count;
  for (const r of resolved) resolvedMap[r.date] = r.count;

  const allDates = Array.from(new Set([...Object.keys(createdMap), ...Object.keys(resolvedMap)])).sort();
  const trend = allDates.map(date => ({
    date,
    created: createdMap[date] ?? 0,
    resolved: resolvedMap[date] ?? 0,
  }));

  res.json(trend);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const [issue] = await db.select().from(issuesTable).where(eq(issuesTable.id, id));
  if (!issue) { res.status(404).json({ error: "Not found" }); return; }
  res.json({
    ...issue,
    createdAt: issue.createdAt.toISOString(),
    updatedAt: issue.updatedAt.toISOString(),
    description: issue.description ?? null,
    responsible: issue.responsible ?? null,
    dueDate: issue.dueDate ?? null,
  });
});

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const { title, description, category, priority, status, responsible, dueDate } = req.body;
  const updates: Partial<typeof issuesTable.$inferInsert> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (category !== undefined) updates.category = category;
  if (priority !== undefined) updates.priority = priority;
  if (status !== undefined) updates.status = status;
  if (responsible !== undefined) updates.responsible = responsible;
  if (dueDate !== undefined) updates.dueDate = dueDate;
  updates.updatedAt = new Date();

  const [updated] = await db.update(issuesTable).set(updates).where(eq(issuesTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    description: updated.description ?? null,
    responsible: updated.responsible ?? null,
    dueDate: updated.dueDate ?? null,
  });
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  await db.delete(issuesTable).where(eq(issuesTable.id, id));
  res.status(204).send();
});

export default router;
