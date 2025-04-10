/**
 * 数据存储模块
 * 用于存储模拟数据，替代数据库
 */

// 存储任务的数组
export let tasks = [
  {
    id: '1001',
    title: '完成项目报告',
    description: '完成季度项目进度报告并提交给项目经理',
    type: 'WORK',
    status: 'TODO',
    priority: 3,
    dueDate: '2023-05-20T00:00:00.000Z',
    createdAt: '2023-05-10T09:00:00.000Z',
    updatedAt: '2023-05-10T09:00:00.000Z',
    tags: ['报告', '项目'],
    treeType: 'OAK',
    growthStage: 1
  },
  {
    id: '1002',
    title: '安排团队会议',
    description: '为下周的项目启动安排团队会议',
    type: 'WORK',
    status: 'IN_PROGRESS',
    priority: 2,
    dueDate: '2023-05-15T00:00:00.000Z',
    createdAt: '2023-05-09T14:30:00.000Z',
    updatedAt: '2023-05-11T10:15:00.000Z',
    tags: ['会议', '团队'],
    treeType: 'PINE',
    growthStage: 2
  }
];

// 存储树木的数组
export let trees = [
  {
    id: 'tree-1001',
    taskId: '1001',
    type: 'OAK',
    stage: 1,
    position: {
      x: 5.0,
      y: 0.0,
      z: 3.0
    },
    rotation: {
      x: 0.0,
      y: 0.5,
      z: 0.0
    },
    scale: {
      x: 1.0,
      y: 1.0,
      z: 1.0
    },
    createdAt: '2023-05-10T09:00:00.000Z',
    lastGrowth: '2023-05-12T10:00:00.000Z',
    healthState: 90
  },
  {
    id: 'tree-1002',
    taskId: '1002',
    type: 'PINE',
    stage: 2,
    position: {
      x: -3.0,
      y: 0.0,
      z: 7.0
    },
    rotation: {
      x: 0.0,
      y: 1.2,
      z: 0.0
    },
    scale: {
      x: 1.0,
      y: 1.0,
      z: 1.0
    },
    createdAt: '2023-05-09T14:30:00.000Z',
    lastGrowth: '2023-05-14T08:00:00.000Z',
    healthState: 85
  }
];

/**
 * 重置数据存储
 * 在测试时使用
 */
export function resetDataStore() {
  tasks = [
    {
      id: '1001',
      title: '完成项目报告',
      description: '完成季度项目进度报告并提交给项目经理',
      type: 'WORK',
      status: 'TODO',
      priority: 3,
      dueDate: '2023-05-20T00:00:00.000Z',
      createdAt: '2023-05-10T09:00:00.000Z',
      updatedAt: '2023-05-10T09:00:00.000Z',
      tags: ['报告', '项目'],
      treeType: 'OAK',
      growthStage: 1
    },
    {
      id: '1002',
      title: '安排团队会议',
      description: '为下周的项目启动安排团队会议',
      type: 'WORK',
      status: 'IN_PROGRESS',
      priority: 2,
      dueDate: '2023-05-15T00:00:00.000Z',
      createdAt: '2023-05-09T14:30:00.000Z',
      updatedAt: '2023-05-11T10:15:00.000Z',
      tags: ['会议', '团队'],
      treeType: 'PINE',
      growthStage: 2
    }
  ];

  trees = [
    {
      id: 'tree-1001',
      taskId: '1001',
      type: 'OAK',
      stage: 1,
      position: {
        x: 5.0,
        y: 0.0,
        z: 3.0
      },
      rotation: {
        x: 0.0,
        y: 0.5,
        z: 0.0
      },
      scale: {
        x: 1.0,
        y: 1.0,
        z: 1.0
      },
      createdAt: '2023-05-10T09:00:00.000Z',
      lastGrowth: '2023-05-12T10:00:00.000Z',
      healthState: 90
    },
    {
      id: 'tree-1002',
      taskId: '1002',
      type: 'PINE',
      stage: 2,
      position: {
        x: -3.0,
        y: 0.0,
        z: 7.0
      },
      rotation: {
        x: 0.0,
        y: 1.2,
        z: 0.0
      },
      scale: {
        x: 1.0,
        y: 1.0,
        z: 1.0
      },
      createdAt: '2023-05-09T14:30:00.000Z',
      lastGrowth: '2023-05-14T08:00:00.000Z',
      healthState: 85
    }
  ];
} 