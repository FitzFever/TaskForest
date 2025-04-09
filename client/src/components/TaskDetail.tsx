/**
 * 任务详情组件
 * 显示任务详细信息和相关的树木健康状态
 */
import React, { useEffect, useState } from 'react';
import { Modal, Descriptions, Tag, Divider, Row, Col, Spin, Typography, message, Button } from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined,
  FlagOutlined,
  TagsOutlined,
  ApartmentOutlined,
  AimOutlined
} from '@ant-design/icons';
import { Task, TaskStatus, TaskPriority } from '../types/Task';
import * as taskService from '../services/taskService';
import * as treeService from '../services/treeService';
import TreeHealthPanel from './TreeHealthPanel';
import { TaskTreeHealth } from '../services/treeHealthService';

const { Title, Text } = Typography;

// 状态颜色映射
const statusColors: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'default',
  [TaskStatus.IN_PROGRESS]: 'processing',
  [TaskStatus.COMPLETED]: 'success',
  [TaskStatus.CANCELLED]: 'error'
};

// 优先级颜色映射
const priorityColors: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'green',
  [TaskPriority.MEDIUM]: 'blue',
  [TaskPriority.HIGH]: 'orange',
  [TaskPriority.URGENT]: 'red'
};

// 状态名称映射
const statusNames: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: '待办',
  [TaskStatus.IN_PROGRESS]: '进行中',
  [TaskStatus.COMPLETED]: '已完成',
  [TaskStatus.CANCELLED]: '已取消'
};

// 优先级名称映射
const priorityNames: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: '低',
  [TaskPriority.MEDIUM]: '中',
  [TaskPriority.HIGH]: '高',
  [TaskPriority.URGENT]: '紧急'
};

// 树木类型名称映射
const treeTypeNames: Record<string, string> = {
  'OAK': '橡树',
  'PINE': '松树',
  'CHERRY': '樱花树',
  'MAPLE': '枫树',
  'PALM': '棕榈树'
};

interface TaskDetailProps {
  taskId?: string;
  visible: boolean;
  onClose: () => void;
  onTaskUpdate?: (taskId: string) => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ 
  taskId, 
  visible, 
  onClose,
  onTaskUpdate
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [task, setTask] = useState<Task | null>(null);
  const [treeId, setTreeId] = useState<string | undefined>(undefined);
  
  // 获取任务详情
  useEffect(() => {
    if (taskId && visible) {
      setLoading(true);
      
      // 获取任务详情
      taskService.getTask(taskId)
        .then(response => {
          if (response && response.data.code === 200) {
            setTask(response.data.data);
            
            // 获取关联的树木ID
            treeService.getTreeByTaskId(taskId)
              .then(treeResponse => {
                if (treeResponse && treeResponse.id) {
                  setTreeId(treeResponse.id);
                }
              })
              .catch(error => {
                console.error('获取树木信息失败:', error);
              });
          } else {
            message.error('获取任务详情失败');
          }
        })
        .catch(error => {
          console.error('获取任务详情失败:', error);
          message.error('获取任务详情失败');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [taskId, visible]);

  // 任务进度更新处理
  const handleProgressUpdate = (taskId: string, progress: number) => {
    // 更新本地任务数据
    if (task) {
      setTask({
        ...task,
        progress // Task接口已添加progress属性
      });
    }
    
    // 通知父组件
    if (onTaskUpdate) {
      onTaskUpdate(taskId);
    }
  };

  // 重置组件状态
  const handleClose = () => {
    setTask(null);
    setTreeId(undefined);
    onClose();
  };

  return (
    <Modal
      title="任务详情"
      open={visible}
      onCancel={handleClose}
      width={800}
      footer={[
        <Button key="close" onClick={handleClose}>
          关闭
        </Button>
      ]}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <Spin size="large" />
        </div>
      ) : task ? (
        <Row gutter={[24, 24]}>
          {/* 任务信息 */}
          <Col span={24}>
            <Title level={4}>{task.title}</Title>
            <Row>
              <Col>
                <Tag color={statusColors[task.status as TaskStatus]}>
                  {statusNames[task.status as TaskStatus]}
                </Tag>
                <Tag color={priorityColors[task.priority as TaskPriority]}>
                  优先级: {priorityNames[task.priority as TaskPriority]}
                </Tag>
                {task.treeType && (
                  <Tag color="green">
                    {treeTypeNames[task.treeType] || task.treeType}
                  </Tag>
                )}
              </Col>
            </Row>
            
            <Divider />
            
            <Descriptions column={2}>
              <Descriptions.Item label={<><CalendarOutlined /> 创建时间</>}>
                {new Date(task.createdAt).toLocaleString()}
              </Descriptions.Item>
              {task.dueDate && (
                <Descriptions.Item label={<><ClockCircleOutlined /> 截止日期</>}>
                  {new Date(task.dueDate).toLocaleString()}
                </Descriptions.Item>
              )}
              {task.progress !== undefined && (
                <Descriptions.Item label={<><AimOutlined /> 当前进度</>}>
                  {task.progress}%
                </Descriptions.Item>
              )}
              {task.type && (
                <Descriptions.Item label={<><FlagOutlined /> 任务类型</>}>
                  {task.type}
                </Descriptions.Item>
              )}
            </Descriptions>
            
            {task.description && (
              <>
                <Title level={5}>描述</Title>
                <Text>{task.description}</Text>
              </>
            )}
            
            {task.tags && task.tags.length > 0 && (
              <>
                <Title level={5} style={{ marginTop: 16 }}>
                  <TagsOutlined /> 标签
                </Title>
                <div>
                  {task.tags.map(tag => (
                    <Tag key={tag} color="blue">
                      {tag}
                    </Tag>
                  ))}
                </div>
              </>
            )}
          </Col>
          
          {/* 树木健康状态面板 */}
          <Col span={24}>
            <Divider orientation="left">
              <ApartmentOutlined /> 关联树木状态
            </Divider>
            <TreeHealthPanel 
              taskId={taskId}
              treeId={treeId}
              onProgressUpdate={handleProgressUpdate}
            />
          </Col>
        </Row>
      ) : (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <Text type="secondary">未找到任务信息</Text>
        </div>
      )}
    </Modal>
  );
};

export default TaskDetail; 