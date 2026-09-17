export type MonthlyGoal = { id: string; name: string; narrative: string; deadline: string }
export type GoalTask = { id: string; goal_id: string; task: string; week: 1|2|3|4; done: boolean }
