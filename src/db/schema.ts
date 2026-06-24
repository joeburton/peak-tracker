// LocalProgress is the IndexedDB representation of a user's peak completion state.
// It mirrors the MongoDB progress document but adds client-only fields.
export interface LocalProgress {
  userId: string // Clerk userId — primary key
  completedPeakIds: string[]
  updatedAt: string // ISO 8601
  lastSyncedAt?: string // ISO 8601 — absent if never synced
  dirty: boolean // true = has unsynced local changes; never persisted to MongoDB
  version: number
}

// LocalUserPreferences holds syncable user preferences — settings that should
// follow the user across devices (e.g. units).
// Device-local UI state (theme, viewMode, sidebar) is handled by Zustand persist,
// not stored here.
export interface LocalUserPreferences {
  userId: string // Clerk userId — primary key
  units: 'metric' | 'imperial'
}
