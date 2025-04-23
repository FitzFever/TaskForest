import React, { useState } from 'react';
import { Button, Divider, Typography, Space } from 'antd';
import { PlusOutlined, RobotOutlined } from '@ant-design/icons';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import TaskBreakdownModal from '../components/TaskBreakdownModal';

const { Title } = Typography;

/**
 * 任务页面组件
 */
const TaskPage: React.FC = () => {
  // 状态
  const [taskFormVisible, setTaskFormVisible] = useState(false);
  const [taskBreakdownVisible, setTaskBreakdownVisible] = useState(false);
  
  // 任务创建处理
  const handleTaskCreated = (task: any) => {
    // 刷新任务列表或其他处理
    console.log('任务已创建:', task);
    setTaskFormVisible(false);
  };
  
  // AI任务拆解后创建任务处理
  const handleAiTasksCreated = (result: any) => {
    // 刷新任务列表或其他处理
    console.log('AI拆解任务已创建:', result);
    setTaskBreakdownVisible(false);
  };
  
  return (
    <div className="task-page">
      <div className="task-page-header">
        <div className="title-section">
          <Title level={2}>任务管理</Title>
        </div>
        
        <div className="action-section">
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setTaskFormVisible(true)}
            >
              创建任务
            </Button>
            <Button 
              icon={<RobotOutlined />} 
              onClick={() => setTaskBreakdownVisible(true)}
            >
              AI任务拆解
            </Button>
          </Space>
        </div>
      </div>
      
      <Divider />
      
      <div className="task-list-container">
        <TaskList />
      </div>
      
      {/* 任务创建表单 */}
      <TaskForm 
        visible={taskFormVisible}
        onClose={() => setTaskFormVisible(false)}
        onTaskCreated={handleTaskCreated}
      />
      
      {/* AI任务拆解模态框 */}
      <TaskBreakdownModal
        visible={taskBreakdownVisible}
        onClose={() => setTaskBreakdownVisible(false)}
        onTasksCreated={handleAiTasksCreated}
      />
    </div>
  );
};

export default TaskPage; 