export type Theme = "dark" | "light";
export type Currency = "GBP" | "EUR";
export type Category = "health" | "discipline" | "mind" | "business";
export type TrainingType = "gym" | "cardio" | "walk" | "mobility" | "recovery" | "rest";
export interface UserSettings { name: string; theme: Theme; currency: Currency; timezone: string; firstDayOfWeek: 0 | 1; waterTargetMl: number; sleepTargetHours: number; socialLimitMinutes: number; fitnessWeeklyTarget: number; readingDailyMinutes: number; businessWeeklyHours: number; outreachWeeklyTarget: number; learningWeeklySessions: number; onboardingComplete: boolean; lastBackupAt?: string; }
export interface Cycle { id: string; name: string; startDate: string; endDate: string; weeks: number; themes: string[]; }
export interface HabitDefinition { id: string; name: string; category: Category; weekdays: number[]; weight: number; hidden: boolean; order: number; }
export interface DailyPriority { id: string; title: string; category: string; estimatedMinutes: number; actualMinutes: number; notes: string; completed: boolean; }
export interface MealEntry { ate: boolean; healthy: boolean; }
export interface FitnessSession { completed: boolean; type: TrainingType; durationMinutes: number; notes: string; }
export interface OutreachEntry { sent: number; followUps: number; calls: number; responses: number; meetings: number; proposals: number; closed: number; }
export interface DailyLog { id: string; cycleId: string; date: string; dayNumber: number; weekNumber: number; weekday: number; completions: Record<string, boolean>; priorities: DailyPriority[]; waterMl: number; sleepHours: number; sleepQuality: number; fitness: FitnessSession; meals: Record<"breakfast" | "lunch" | "dinner", MealEntry>; socialMinutes: number; businessMinutes: number; learningMinutes: number; readingMinutes: number; bibleMinutes: number; outreach: OutreachEntry; reflection: string; scoreSnapshot?: number; scoreWeightsSnapshot?: Record<string, number>; }
export interface Client { id: string; businessName: string; contactName: string; email: string; phone: string; website: string; businessType: string; source: string; firstContacted: string; status: string; }
export interface Project { id: string; name: string; clientId?: string; description: string; stage: string; deadline: string; progress: number; priority: string; techStack: string; repositoryUrl: string; liveUrl: string; price: number; paid: number; currency?: Currency; }
export interface ExpenseEntry { id: string; amount: number; date: string; category: string; description: string; scope: "business" | "personal"; currency?: Currency; }
export interface IncomeEntry { id: string; amount: number; date: string; source: string; clientId?: string; projectId?: string; scope: "business" | "personal"; description: string; currency?: Currency; }
export interface Goal { id: string; name: string; label: string; target: number; targetDate?: string; accent: string; currency?: Currency; }
export interface GoalContribution { id: string; goalId: string; amount: number; date: string; note: string; currency?: Currency; }
export interface Idea { id: string; title: string; description: string; category: string; priority: string; status: string; date: string; }
export interface Appointment { id: string; title: string; date: string; time: string; category: string; completed: boolean; notes: string; }
export interface FocusSession { id: string; category: string; task: string; minutes: number; date: string; notes: string; completed: boolean; }
export interface ReadingSession { id: string; type: "bible" | "book"; resource: string; pages?: number; chapter?: string; minutes: number; date: string; notes: string; lesson: string; }
export interface LearningTrack { id: string; name: string; category: string; progress: number; hours: number; skills?: Record<string, number>; courseUrl?: string; currentModule?: string; currentLesson?: string; nextAction?: string; keyTakeaway?: string; practicePlan?: string; studyNotes?: string; }
export interface WeeklyReview { id: string; cycleId: string; weekNumber: number; wins: string; friction: string; lesson: string; nextObjective: string; ratings: Record<string, number>; }
export interface AppData { version: 1; settings: UserSettings; cycles: Cycle[]; habits: HabitDefinition[]; dailyLogs: DailyLog[]; clients: Client[]; projects: Project[]; expenses: ExpenseEntry[]; income: IncomeEntry[]; goals: Goal[]; contributions: GoalContribution[]; ideas: Idea[]; appointments: Appointment[]; focusSessions: FocusSession[]; readingSessions: ReadingSession[]; learningTracks: LearningTrack[]; weeklyReviews: WeeklyReview[]; }

export interface FieldClock { at: number; sequence: number; deviceId: string; }
export type FieldClockMap = Record<string, FieldClock>;
export interface SyncEnvelope { version: 1; data: AppData; clocks: FieldClockMap; tombstones: FieldClockMap; revision: number; deviceId: string; updatedAt: string; pending: boolean; }
export type SyncStatus = "saving-local" | "syncing" | "synced" | "offline" | "error";
