export interface TodoItem {
  id: number;
  title: string;
  durationMs: number;
  completedAt: Date | null;
  createdAt: Date;
}
