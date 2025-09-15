/**
 * 开发环境模拟数据
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
    progress: 0,
    dueDate: '2023-05-20T00:00:00.000Z',
    createdAt: '2023-05-10T09:00:00.000Z',
    updatedAt: '2023-05-10T09:00:00.000Z',
    tags: ['报告', '项目'],
    treeType: 'MAPLE',
    growthStage: 0
  },
  {
    id: '1002',
    title: '安排团队会议',
    description: '为下周的项目启动安排团队会议',
    type: 'WORK',
    status: 'IN_PROGRESS',
    priority: 2,
    progress: 40,
    dueDate: '2023-05-15T00:00:00.000Z',
    createdAt: '2023-05-09T14:30:00.000Z',
    updatedAt: '2023-05-11T10:15:00.000Z',
    tags: ['会议', '团队'],
    treeType: 'MAPLE',
    growthStage: 1
  },
  {
    id: '1003',
    title: '学习React框架',
    description: '完成React基础教程并构建一个示例应用',
    type: 'LEARNING',
    status: 'IN_PROGRESS',
    priority: 2,
    progress: 70,
    dueDate: '2023-05-30T00:00:00.000Z',
    createdAt: '2023-05-05T08:00:00.000Z',
    updatedAt: '2023-05-12T16:30:00.000Z',
    tags: ['学习', '编程', 'React'],
    treeType: 'APPLE',
    growthStage: 2
  },
  {
    id: '1004',
    title: '每周健身计划',
    description: '完成每周三次的健身训练',
    type: 'RECURRING',
    status: 'TODO',
    priority: 1,
    progress: 0,
    dueDate: '2023-05-14T00:00:00.000Z',
    createdAt: '2023-05-07T10:00:00.000Z',
    updatedAt: '2023-05-07T10:00:00.000Z',
    tags: ['健身', '健康'],
    treeType: 'PINE',
    growthStage: 0
  },
  {
    id: '1005',
    title: '完成产品设计',
    description: '完成新产品原型设计并提交审核',
    type: 'PROJECT',
    status: 'COMPLETED',
    priority: 3,
    progress: 100,
    dueDate: '2023-05-08T00:00:00.000Z',
    createdAt: '2023-04-20T09:30:00.000Z',
    updatedAt: '2023-05-07T14:20:00.000Z',
    completedAt: '2023-05-07T14:20:00.000Z',
    tags: ['设计', '产品'],
    treeType: 'WILLOW',
    growthStage: 3
  },
  {
    id: '1006',
    title: '阅读《原子习惯》',
    description: '完成《原子习惯》全书阅读并做笔记',
    type: 'LEISURE',
    status: 'IN_PROGRESS',
    priority: 1,
    progress: 30,
    dueDate: '2023-06-01T00:00:00.000Z',
    createdAt: '2023-05-01T18:00:00.000Z',
    updatedAt: '2023-05-10T20:15:00.000Z',
    tags: ['阅读', '自我提升'],
    treeType: 'PALM',
    growthStage: 1
  },
  {
    id: '1007',
    title: '日常邮件整理',
    description: '整理工作邮箱并回复重要邮件',
    type: 'NORMAL',
    status: 'TODO',
    priority: 2,
    progress: 0,
    dueDate: '2023-05-12T00:00:00.000Z',
    createdAt: '2023-05-11T09:00:00.000Z',
    updatedAt: '2023-05-11T09:00:00.000Z',
    tags: ['邮件', '整理'],
    treeType: 'OAK',
    growthStage: 0
  },
  {
    id: '1008',
    title: '准备季度财务报表',
    description: '收集和整理第一季度财务数据并生成报表',
    type: 'WORK',
    status: 'CANCELLED',
    priority: 3,
    progress: 20,
    dueDate: '2023-04-30T00:00:00.000Z',
    createdAt: '2023-04-15T10:30:00.000Z',
    updatedAt: '2023-04-25T16:45:00.000Z',
    tags: ['财务', '报表'],
    treeType: 'MAPLE',
    growthStage: 0
  }
];

// 存储树木的数组
export let trees = [
  {
    id: 'tree-1001',
    taskId: '1001',
    type: 'MAPLE',
    stage: 0,
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
      x: 1.5,
      y: 1.5,
      z: 1.5
    },
    createdAt: '2023-05-10T09:00:00.000Z',
    lastGrowth: '2023-05-12T10:00:00.000Z',
    healthState: 90
  },
  {
    id: 'tree-1002',
    taskId: '1002',
    type: 'MAPLE',
    stage: 1,
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
      x: 1.8,
      y: 2.0,
      z: 1.8
    },
    createdAt: '2023-05-09T14:30:00.000Z',
    lastGrowth: '2023-05-14T08:00:00.000Z',
    healthState: 85
  },
  {
    id: 'tree-1003',
    taskId: '1003',
    type: 'APPLE',
    stage: 2,
    position: {
      x: 2.5,
      y: 0.0,
      z: -4.0
    },
    rotation: {
      x: 0.0,
      y: 0.8,
      z: 0.0
    },
    scale: {
      x: 2.2,
      y: 2.5,
      z: 2.2
    },
    createdAt: '2023-05-05T08:00:00.000Z',
    lastGrowth: '2023-05-12T16:30:00.000Z',
    healthState: 80
  },
  {
    id: 'tree-1004',
    taskId: '1004',
    type: 'PINE',
    stage: 0,
    position: {
      x: -6.0,
      y: 0.0,
      z: -2.0
    },
    rotation: {
      x: 0.0,
      y: 2.1,
      z: 0.0
    },
    scale: {
      x: 1.6,
      y: 1.8,
      z: 1.6
    },
    createdAt: '2023-05-07T10:00:00.000Z',
    lastGrowth: '2023-05-07T10:00:00.000Z',
    healthState: 95
  },
  {
    id: 'tree-1005',
    taskId: '1005',
    type: 'WILLOW',
    stage: 3,
    position: {
      x: 7.5,
      y: 0.0,
      z: 6.0
    },
    rotation: {
      x: 0.0,
      y: 1.7,
      z: 0.0
    },
    scale: {
      x: 3.0,
      y: 3.2,
      z: 3.0
    },
    createdAt: '2023-04-20T09:30:00.000Z',
    lastGrowth: '2023-05-07T14:20:00.000Z',
    healthState: 100
  },
  {
    id: 'tree-1006',
    taskId: '1006',
    type: 'PALM',
    stage: 1,
    position: {
      x: -1.0,
      y: 0.0,
      z: -8.0
    },
    rotation: {
      x: 0.0,
      y: 0.3,
      z: 0.0
    },
    scale: {
      x: 2.0,
      y: 2.5,
      z: 2.0
    },
    createdAt: '2023-05-01T18:00:00.000Z',
    lastGrowth: '2023-05-10T20:15:00.000Z',
    healthState: 75
  },
  {
    id: 'tree-1007',
    taskId: '1007',
    type: 'OAK',
    stage: 0,
    position: {
      x: 3.0,
      y: 0.0,
      z: 8.0
    },
    rotation: {
      x: 0.0,
      y: 2.5,
      z: 0.0
    },
    scale: {
      x: 1.7,
      y: 1.7,
      z: 1.7
    },
    createdAt: '2023-05-11T09:00:00.000Z',
    lastGrowth: '2023-05-11T09:00:00.000Z',
    healthState: 100
  },
  {
    id: 'tree-1008',
    taskId: '1008',
    type: 'MAPLE',
    stage: 0,
    position: {
      x: -7.0,
      y: 0.0,
      z: 4.0
    },
    rotation: {
      x: 0.0,
      y: 1.9,
      z: 0.0
    },
    scale: {
      x: 1.4,
      y: 1.3,
      z: 1.4
    },
    createdAt: '2023-04-15T10:30:00.000Z',
    lastGrowth: '2023-04-25T16:45:00.000Z',
    healthState: 30
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
      progress: 0,
      dueDate: '2023-05-20T00:00:00.000Z',
      createdAt: '2023-05-10T09:00:00.000Z',
      updatedAt: '2023-05-10T09:00:00.000Z',
      tags: ['报告', '项目'],
      treeType: 'MAPLE',
      growthStage: 0
    },
    {
      id: '1002',
      title: '安排团队会议',
      description: '为下周的项目启动安排团队会议',
      type: 'WORK',
      status: 'IN_PROGRESS',
      priority: 2,
      progress: 40,
      dueDate: '2023-05-15T00:00:00.000Z',
      createdAt: '2023-05-09T14:30:00.000Z',
      updatedAt: '2023-05-11T10:15:00.000Z',
      tags: ['会议', '团队'],
      treeType: 'MAPLE',
      growthStage: 1
    },
    {
      id: '1003',
      title: '学习React框架',
      description: '完成React基础教程并构建一个示例应用',
      type: 'LEARNING',
      status: 'IN_PROGRESS',
      priority: 2,
      progress: 70,
      dueDate: '2023-05-30T00:00:00.000Z',
      createdAt: '2023-05-05T08:00:00.000Z',
      updatedAt: '2023-05-12T16:30:00.000Z',
      tags: ['学习', '编程', 'React'],
      treeType: 'APPLE',
      growthStage: 2
    },
    {
      id: '1004',
      title: '每周健身计划',
      description: '完成每周三次的健身训练',
      type: 'RECURRING',
      status: 'TODO',
      priority: 1,
      progress: 0,
      dueDate: '2023-05-14T00:00:00.000Z',
      createdAt: '2023-05-07T10:00:00.000Z',
      updatedAt: '2023-05-07T10:00:00.000Z',
      tags: ['健身', '健康'],
      treeType: 'PINE',
      growthStage: 0
    },
    {
      id: '1005',
      title: '完成产品设计',
      description: '完成新产品原型设计并提交审核',
      type: 'PROJECT',
      status: 'COMPLETED',
      priority: 3,
      progress: 100,
      dueDate: '2023-05-08T00:00:00.000Z',
      createdAt: '2023-04-20T09:30:00.000Z',
      updatedAt: '2023-05-07T14:20:00.000Z',
      completedAt: '2023-05-07T14:20:00.000Z',
      tags: ['设计', '产品'],
      treeType: 'WILLOW',
      growthStage: 3
    },
    {
      id: '1006',
      title: '阅读《原子习惯》',
      description: '完成《原子习惯》全书阅读并做笔记',
      type: 'LEISURE',
      status: 'IN_PROGRESS',
      priority: 1,
      progress: 30,
      dueDate: '2023-06-01T00:00:00.000Z',
      createdAt: '2023-05-01T18:00:00.000Z',
      updatedAt: '2023-05-10T20:15:00.000Z',
      tags: ['阅读', '自我提升'],
      treeType: 'PALM',
      growthStage: 1
    },
    {
      id: '1007',
      title: '日常邮件整理',
      description: '整理工作邮箱并回复重要邮件',
      type: 'NORMAL',
      status: 'TODO',
      priority: 2,
      progress: 0,
      dueDate: '2023-05-12T00:00:00.000Z',
      createdAt: '2023-05-11T09:00:00.000Z',
      updatedAt: '2023-05-11T09:00:00.000Z',
      tags: ['邮件', '整理'],
      treeType: 'OAK',
      growthStage: 0
    },
    {
      id: '1008',
      title: '准备季度财务报表',
      description: '收集和整理第一季度财务数据并生成报表',
      type: 'WORK',
      status: 'CANCELLED',
      priority: 3,
      progress: 20,
      dueDate: '2023-04-30T00:00:00.000Z',
      createdAt: '2023-04-15T10:30:00.000Z',
      updatedAt: '2023-04-25T16:45:00.000Z',
      tags: ['财务', '报表'],
      treeType: 'MAPLE',
      growthStage: 0
    }
  ];

  trees = [
    {
      id: 'tree-1001',
      taskId: '1001',
      type: 'MAPLE',
      stage: 0,
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
        x: 1.5,
        y: 1.5,
        z: 1.5
      },
      createdAt: '2023-05-10T09:00:00.000Z',
      lastGrowth: '2023-05-12T10:00:00.000Z',
      healthState: 90
    },
    {
      id: 'tree-1002',
      taskId: '1002',
      type: 'MAPLE',
      stage: 1,
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
        x: 1.8,
        y: 2.0,
        z: 1.8
      },
      createdAt: '2023-05-09T14:30:00.000Z',
      lastGrowth: '2023-05-14T08:00:00.000Z',
      healthState: 85
    },
    {
      id: 'tree-1003',
      taskId: '1003',
      type: 'APPLE',
      stage: 2,
      position: {
        x: 2.5,
        y: 0.0,
        z: -4.0
      },
      rotation: {
        x: 0.0,
        y: 0.8,
        z: 0.0
      },
      scale: {
        x: 2.2,
        y: 2.5,
        z: 2.2
      },
      createdAt: '2023-05-05T08:00:00.000Z',
      lastGrowth: '2023-05-12T16:30:00.000Z',
      healthState: 80
    },
    {
      id: 'tree-1004',
      taskId: '1004',
      type: 'PINE',
      stage: 0,
      position: {
        x: -6.0,
        y: 0.0,
        z: -2.0
      },
      rotation: {
        x: 0.0,
        y: 2.1,
        z: 0.0
      },
      scale: {
        x: 1.6,
        y: 1.8,
        z: 1.6
      },
      createdAt: '2023-05-07T10:00:00.000Z',
      lastGrowth: '2023-05-07T10:00:00.000Z',
      healthState: 95
    },
    {
      id: 'tree-1005',
      taskId: '1005',
      type: 'WILLOW',
      stage: 3,
      position: {
        x: 7.5,
        y: 0.0,
        z: 6.0
      },
      rotation: {
        x: 0.0,
        y: 1.7,
        z: 0.0
      },
      scale: {
        x: 3.0,
        y: 3.2,
        z: 3.0
      },
      createdAt: '2023-04-20T09:30:00.000Z',
      lastGrowth: '2023-05-07T14:20:00.000Z',
      healthState: 100
    },
    {
      id: 'tree-1006',
      taskId: '1006',
      type: 'PALM',
      stage: 1,
      position: {
        x: -1.0,
        y: 0.0,
        z: -8.0
      },
      rotation: {
        x: 0.0,
        y: 0.3,
        z: 0.0
      },
      scale: {
        x: 2.0,
        y: 2.5,
        z: 2.0
      },
      createdAt: '2023-05-01T18:00:00.000Z',
      lastGrowth: '2023-05-10T20:15:00.000Z',
      healthState: 75
    },
    {
      id: 'tree-1007',
      taskId: '1007',
      type: 'OAK',
      stage: 0,
      position: {
        x: 3.0,
        y: 0.0,
        z: 8.0
      },
      rotation: {
        x: 0.0,
        y: 2.5,
        z: 0.0
      },
      scale: {
        x: 1.7,
        y: 1.7,
        z: 1.7
      },
      createdAt: '2023-05-11T09:00:00.000Z',
      lastGrowth: '2023-05-11T09:00:00.000Z',
      healthState: 100
    },
    {
      id: 'tree-1008',
      taskId: '1008',
      type: 'MAPLE',
      stage: 0,
      position: {
        x: -7.0,
        y: 0.0,
        z: 4.0
      },
      rotation: {
        x: 0.0,
        y: 1.9,
        z: 0.0
      },
      scale: {
        x: 1.4,
        y: 1.3,
        z: 1.4
      },
      createdAt: '2023-04-15T10:30:00.000Z',
      lastGrowth: '2023-04-25T16:45:00.000Z',
      healthState: 30
    }
  ];
} 