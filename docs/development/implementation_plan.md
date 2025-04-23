# TaskForest 功能实施计划

本文档详细描述了 TaskForest 项目下一阶段的功能实施计划，包括前后端任务划分、实施步骤和时间安排。本计划主要针对开发任务列表中完成度较低的高优先级功能进行详细规划。

## 目标功能

根据 [开发任务列表](../development_tasks.md) 分析，我们将优先实施以下功能：

1. **截止日期提醒系统** (当前完成度 50%)
2. **任务统计功能** (当前完成度 20%)
3. **树木健康计算逻辑** (当前完成度 85%)
4. **引导教程系统** (当前完成度 15%)

## 功能实施计划

### 1. 截止日期提醒系统

#### 前端部分

1. **通知组件开发**
   - 创建 `client/src/components/NotificationSystem.tsx` 组件
   - 实现任务到期检查逻辑
   - 根据设置时间提前发送提醒
   - 支持不同紧急程度的提醒样式

2. **集成到应用流程**
   - 修改 `client/src/App.tsx`，添加通知组件
   - 确保通知系统仅在用户启用设置时工作
   - 实现浏览器通知权限请求

3. **通知设置优化**
   - 完善 `client/src/components/SettingsPanel.tsx` 中的通知设置
   - 添加自定义提醒时间设置
   - 添加提醒频率设置

#### 后端部分

1. **通知服务实现**
   - 创建 `server/src/services/notificationService.ts`
   - 实现截止日期计算逻辑
   - 添加任务到期状态检查功能

2. **通知API端点**
   - 创建 `server/src/controllers/notificationController.ts`
   - 实现获取即将到期任务的API
   - 实现标记提醒已读的API

3. **系统集成**
   - 修改 `server/src/routes/api.ts` 添加通知相关路由
   - 在任务更新时触发通知状态更新

#### 参考代码示例

```typescript
// client/src/components/NotificationSystem.tsx
import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import { useTaskStore } from '../store/taskStore';
import { useSettingsStore } from '../store/settingsStore';
import dayjs from 'dayjs';
import { ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';

const NotificationSystem: React.FC = () => {
  const { tasks } = useTaskStore();
  const { settings } = useSettingsStore();
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  
  // 请求通知权限
  useEffect(() => {
    if (settings.notificationsEnabled && 'Notification' in window) {
      Notification.requestPermission();
    }
  }, [settings.notificationsEnabled]);

  // 监控任务截止日期
  useEffect(() => {
    if (!settings.notificationsEnabled) return;
    
    const checkDeadlines = () => {
      const now = dayjs();
      
      tasks.forEach(task => {
        // 忽略已完成和已提醒的任务
        if (task.completed || checkedTasks[task.id]) return;
        
        if (task.dueDate) {
          const dueDate = dayjs(task.dueDate);
          const hoursRemaining = dueDate.diff(now, 'hour');
          
          // 任务即将到期提醒
          if (hoursRemaining === settings.dueDateReminderHours) {
            notification.info({
              message: '任务即将到期',
              description: `任务"${task.title}"将在${settings.dueDateReminderHours}小时后到期`,
              icon: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
              duration: 0
            });
            
            // 标记任务已提醒
            setCheckedTasks(prev => ({ ...prev, [task.id]: true }));
          }
          
          // 紧急任务提醒（少于3小时）
          if (hoursRemaining <= 3 && hoursRemaining > 0 && !checkedTasks[`${task.id}-urgent`]) {
            notification.warning({
              message: '任务紧急',
              description: `任务"${task.title}"即将在${hoursRemaining}小时后到期`,
              icon: <WarningOutlined style={{ color: '#faad14' }} />,
              duration: 0
            });
            
            setCheckedTasks(prev => ({ ...prev, [`${task.id}-urgent`]: true }));
          }
        }
      });
    };
    
    // 初次检查
    checkDeadlines();
    
    // 设置定期检查
    const intervalId = setInterval(checkDeadlines, 10 * 60 * 1000); // 每10分钟检查一次
    
    return () => clearInterval(intervalId);
  }, [tasks, settings, checkedTasks]);
  
  return null; // 纯功能组件，无需渲染UI
};

export default NotificationSystem;
```

### 2. 任务统计功能

#### 前端部分

1. **基础统计组件**
   - 创建 `client/src/components/TaskStatistics.tsx`
   - 实现基本统计展示（总数、已完成、未完成）
   - 实现完成率和趋势图表

2. **高级统计功能**
   - 添加任务分类统计
   - 实现时间段统计（今日、本周、本月）
   - 添加优先级分布图表

3. **UI集成**
   - 在仪表板页面添加统计卡片
   - 在任务列表页面添加简要统计
   - 实现统计数据导出功能

#### 后端部分

1. **统计数据API**
   - 创建 `server/src/services/statisticsService.ts`
   - 实现各类统计数据计算函数
   - 添加数据聚合功能

2. **性能优化**
   - 实现统计数据缓存
   - 优化大数据量查询性能
   - 添加定时统计任务

#### 参考代码示例

```typescript
// client/src/components/TaskStatistics.tsx
import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic, Progress, Divider } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTaskStore } from '../store/taskStore';
import { TaskStatus } from '../types/Task';
import dayjs from 'dayjs';

const TaskStatistics: React.FC = () => {
  const { tasks } = useTaskStore();
  
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const todo = tasks.filter(t => t.status === TaskStatus.TODO).length;
    
    // 计算过期任务
    const now = dayjs();
    const overdue = tasks.filter(t => 
      t.status !== TaskStatus.COMPLETED && 
      t.dueDate && 
      dayjs(t.dueDate).isBefore(now)
    ).length;
    
    // 计算本周完成
    const startOfWeek = now.startOf('week');
    const completedThisWeek = tasks.filter(t => 
      t.status === TaskStatus.COMPLETED && 
      t.completedAt && 
      dayjs(t.completedAt).isAfter(startOfWeek)
    ).length;
    
    // 计算完成率
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    return {
      total,
      completed,
      inProgress,
      todo,
      overdue,
      completedThisWeek,
      completionRate
    };
  }, [tasks]);
  
  return (
    <Card title="任务统计">
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Statistic 
            title="总任务数" 
            value={stats.total} 
          />
        </Col>
        <Col span={8}>
          <Statistic 
            title="已完成任务" 
            value={stats.completed}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          />
        </Col>
        <Col span={8}>
          <Statistic 
            title="进行中任务" 
            value={stats.inProgress}
            prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
          />
        </Col>
      </Row>
      
      <Divider />
      
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Statistic 
            title="待办任务" 
            value={stats.todo}
          />
        </Col>
        <Col span={8}>
          <Statistic 
            title="已逾期任务" 
            value={stats.overdue}
            prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
          />
        </Col>
        <Col span={8}>
          <Statistic 
            title="本周完成" 
            value={stats.completedThisWeek}
          />
        </Col>
      </Row>
      
      <Divider />
      
      <div style={{ textAlign: 'center' }}>
        <h4>任务完成率</h4>
        <Progress 
          type="circle" 
          percent={Math.round(stats.completionRate)} 
          status={stats.completionRate >= 80 ? "success" : stats.completionRate >= 50 ? "normal" : "exception"}
        />
      </div>
    </Card>
  );
};

export default TaskStatistics;
```

### 3. 完善树木健康计算逻辑

#### 前端部分

1. **健康状态可视化**
   - 改进 `client/src/components/TreeModel.tsx` 健康状态渲染
   - 添加健康状态变化动画
   - 实现交互式健康状态提示

2. **健康状态监控**
   - 创建 `client/src/components/TreeHealthMonitor.tsx`
   - 实现健康状态预警
   - 添加健康恢复建议功能

#### 后端部分

1. **健康计算逻辑优化**
   - 完善 `server/src/services/treeHealthCalculationService.ts`
   - 改进时间比例计算公式
   - 实现更细致的健康状态分级

2. **健康预测功能**
   - 实现树木健康趋势预测
   - 添加基于截止日期的健康预警
   - 优化健康状态更新频率

#### 参考代码示例

```typescript
// server/src/services/treeHealthCalculationService.ts (片段)
calculateTimeRatio(task: TaskData): number {
  if (!task.dueDate) return 1;
  
  const now = new Date();
  const deadline = new Date(task.dueDate);
  const createdAt = new Date(task.createdAt);
  
  const totalDuration = deadline.getTime() - createdAt.getTime();
  if (totalDuration <= 0) return 0;
  
  const remainingTime = deadline.getTime() - now.getTime();
  
  // 添加平滑过渡和更渐进的衰减曲线
  const ratio = Math.max(0, Math.min(1, remainingTime / totalDuration));
  
  // 使用二次函数使健康下降更加渐进
  // 当剩余时间接近0时，健康下降更快
  return Math.pow(ratio, 1.5);
}
```

### 4. 开发引导教程

#### 前端部分

1. **教程框架**
   - 创建 `client/src/components/TutorialGuide.tsx`
   - 实现步骤导航系统
   - 添加教程进度保存功能

2. **教程内容**
   - 创建任务管理教程步骤
   - 创建树木养护教程步骤
   - 制作功能介绍图片和动画

3. **功能引导**
   - 实现上下文提示系统
   - 添加功能探索引导
   - 实现交互式任务引导

#### 参考代码示例

```typescript
// client/src/components/TutorialGuide.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Steps, Button, Typography } from 'antd';
import { useSettingsStore } from '../store/settingsStore';

const { Step } = Steps;
const { Title, Paragraph } = Typography;

const tutorialSteps = [
  {
    title: '欢迎使用TaskForest',
    content: '这是一款将任务管理与虚拟森林结合的应用。完成任务，种植树木，建立你的森林。',
    image: '/images/tutorial/welcome.png'
  },
  {
    title: '创建任务',
    content: '点击"添加任务"按钮创建新任务。设置任务标题、描述、截止日期和优先级。',
    image: '/images/tutorial/create-task.png'
  },
  {
    title: '跟踪进度',
    content: '使用进度条更新任务完成情况。任务进度将直接影响关联树木的生长状态。',
    image: '/images/tutorial/track-progress.png'
  },
  {
    title: '观察你的森林',
    content: '在森林视图中查看您的树木。随着任务的完成，树木会成长。注意保持树木健康！',
    image: '/images/tutorial/forest-view.png'
  },
  {
    title: '设置提醒',
    content: '使用通知功能设置截止日期提醒，确保任务按时完成，保持树木健康。',
    image: '/images/tutorial/notifications.png'
  }
];

const TutorialGuide: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { settings } = useSettingsStore();
  
  // 检查是否是首次使用
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('taskforest-tutorial-seen');
    if (!hasSeenTutorial) {
      setVisible(true);
    }
  }, []);
  
  const handleComplete = () => {
    localStorage.setItem('taskforest-tutorial-seen', 'true');
    setVisible(false);
  };
  
  return (
    <Modal
      title="TaskForest使用指南"
      open={visible}
      width={700}
      footer={null}
      onCancel={() => setVisible(false)}
    >
      <Steps current={currentStep} direction="horizontal">
        {tutorialSteps.map(step => (
          <Step key={step.title} title={step.title} />
        ))}
      </Steps>
      
      <div style={{ padding: '30px 0', textAlign: 'center' }}>
        <div style={{ marginBottom: '20px' }}>
          {tutorialSteps[currentStep].image && (
            <img
              src={tutorialSteps[currentStep].image}
              alt={tutorialSteps[currentStep].title}
              style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
            />
          )}
        </div>
        
        <Title level={4}>{tutorialSteps[currentStep].title}</Title>
        <Paragraph>{tutorialSteps[currentStep].content}</Paragraph>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep === 0}
        >
          上一步
        </Button>
        
        {currentStep < tutorialSteps.length - 1 ? (
          <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
            下一步
          </Button>
        ) : (
          <Button type="primary" onClick={handleComplete}>
            完成
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default TutorialGuide;
```

## 时间规划

实施计划按照以下时间表进行：

| 周次 | 主要任务 | 次要任务 | 交付物 |
|------|---------|---------|--------|
| 第1周 | 实现通知系统基础功能 | 搭建统计功能框架 | 可运行的截止日期提醒系统 |
| 第2周 | 完成任务统计功能开发 | 健康计算逻辑改进 | 任务统计仪表板和数据可视化 |
| 第3周 | 完善树木健康系统 | 开始开发教程框架 | 优化后的树木健康展示和监控 |
| 第4周 | 实现引导教程系统 | 整合和测试 | 完整的引导教程和系统优化 |

## 开发原则

在实施过程中，将遵循以下原则：

1. **渐进式开发**：遵循[渐进式修改指南](../development/standards.md#渐进式开发)，确保每个功能模块可以独立开发和测试
2. **向后兼容**：保证新功能不会破坏现有功能，在添加新特性时保持向后兼容性
3. **测试驱动**：为每个功能模块编写单元测试和集成测试，确保功能可靠性
4. **用户体验优先**：在开发过程中始终关注用户体验，确保界面友好、交互流畅

## 风险管理

### 潜在风险

1. **性能问题**：随着任务数量增加，统计计算和通知检查可能导致性能下降
2. **浏览器兼容性**：通知API在不同浏览器上的实现有差异
3. **数据同步**：前后端数据同步可能出现延迟或冲突

### 风险缓解措施

1. **性能优化**：实现数据缓存机制，使用批量处理减少计算负担
2. **兼容性测试**：在多种浏览器环境下测试通知功能，提供降级方案
3. **健壮的同步机制**：实现乐观更新和冲突解决策略

## 相关文档

- [开发任务列表](../development_tasks.md)
- [开发规范](./standards.md)
- [树木健康系统设计](../modules/tree_health_system.md)
- [用户界面规范](../design/ui_guidelines.md) 