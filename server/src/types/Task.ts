export interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  status: TaskStatus;
  priority: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  parentTaskId?: string;
  tags: string[];
  treeId?: string;
  subTaskIds?: string[];
  hasSubTasks?: boolean;
  subTaskCount?: number;
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TaskType {
  NORMAL = 'NORMAL',
  WORK = 'WORK',
  LEARNING = 'LEARNING',
  PROJECT = 'PROJECT',
  LEISURE = 'LEISURE'
}

export interface Tree {
  id: string;
  taskId: string;
  type: string;
  stage: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation?: {
    x: number;
    y: number;
    z: number;
  };
  scale?: {
    x: number;
    y: number;
    z: number;
  };
  healthState: number;
  createdAt: string;
  lastGrowth: string;
  parentTreeId?: string;
  subTreeIds?: string[];
} 