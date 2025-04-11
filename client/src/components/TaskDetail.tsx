/**
 * 任务详情组件
 * 显示任务详细信息和相关的树木健康状态
 */
import React, { useEffect, useState } from 'react';
import { 
  Modal, Descriptions, Tag, Divider, Row, Col, Spin, Typography, 
  message, Button, Card, Space, Tooltip, Badge, Progress 
} from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined,
  FlagOutlined,
  TagsOutlined,
  ApartmentOutlined,
  AimOutlined,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Task, TaskStatus, TaskPriority, TaskType } from '../types/Task';
import { TreeType } from '../types/Tree';
import * as taskService from '../services/taskService';
import * as treeService from '../services/treeService';
import TreeHealthPanel from './TreeHealthPanel';
import { TaskTreeHealth } from '../services/treeHealthService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { confirm } = Modal;

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
  'PALM': '棕榈树',
  'APPLE': '苹果树',
  'WILLOW': '柳树'
};

// 任务类型显示标签
const TaskTypeTag: React.FC<{ type: TaskType }> = ({ type }) => {
  const tagColors: Record<TaskType, string> = {
    [TaskType.NORMAL]: 'blue',
    [TaskType.RECURRING]: 'green',
    [TaskType.PROJECT]: 'purple',
    [TaskType.LEARNING]: 'volcano',
    [TaskType.WORK]: 'red',
    [TaskType.LEISURE]: 'gold'
  };

  const typeNames: Record<TaskType, string> = {
    [TaskType.NORMAL]: '普通日常任务',
    [TaskType.RECURRING]: '定期重复任务',
    [TaskType.PROJECT]: '长期项目任务',
    [TaskType.LEARNING]: '学习类任务',
    [TaskType.WORK]: '工作类任务',
    [TaskType.LEISURE]: '休闲类任务'
  };

  return (
    <Tag color={tagColors[type] || 'blue'}>
      {typeNames[type] || type}
    </Tag>
  );
};

// 树木类型显示标签
const TreeTypeTag: React.FC<{ type: TreeType }> = ({ type }) => {
  const tagColors: Record<string, string> = {
    [TreeType.OAK]: 'green',
    [TreeType.PINE]: 'cyan',
    [TreeType.MAPLE]: 'orange',
    [TreeType.PALM]: 'lime',
    [TreeType.APPLE]: 'red',
    [TreeType.WILLOW]: 'purple'
  };

  const typeNames: Record<string, string> = {
    [TreeType.OAK]: '橡树',
    [TreeType.PINE]: '松树',
    [TreeType.MAPLE]: '枫树',
    [TreeType.PALM]: '棕榈树',
    [TreeType.APPLE]: '苹果树',
    [TreeType.WILLOW]: '柳树'
  };

  return (
    <Tag color={tagColors[type] || 'green'}>
      {typeNames[type] || type}
    </Tag>
  );
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
  const [treeInfo, setTreeInfo] = useState<any>(null);
  const [treeLoading, setTreeLoading] = useState(false);
  
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
                  setTreeId(treeResponse.id.toString()); // 转为字符串
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

  // 获取关联的树木信息
  useEffect(() => {
    const fetchTreeInfo = async () => {
      if (task && task.id) {
        setTreeLoading(true);
        try {
          const response = await treeService.getTreeByTask(task.id.toString());
          if (response?.data?.data) {
            setTreeInfo(response.data.data);
          }
        } catch (error) {
          console.error('获取树木信息失败:', error);
        } finally {
          setTreeLoading(false);
        }
      }
    };

    fetchTreeInfo();
  }, [task]);

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

  // 完成任务确认
  const showCompleteConfirm = () => {
    confirm({
      title: '完成任务',
      icon: <CheckOutlined />,
      content: '确认将任务标记为已完成吗？',
      onOk: handleComplete,
      okText: '确认',
      cancelText: '取消',
    });
  };

  // 删除任务确认
  const showDeleteConfirm = () => {
    confirm({
      title: '删除任务',
      icon: <ExclamationCircleOutlined />,
      content: '确认要删除这个任务吗？此操作不可撤销。',
      okType: 'danger',
      onOk: handleDelete,
      okText: '删除',
      cancelText: '取消',
    });
  };

  // 完成任务处理函数
  const handleComplete = async () => {
    try {
      setLoading(true);
      await taskService.completeTask(task!.id.toString());
      message.success('任务已完成！');
      
      if (onTaskUpdate) {
        onTaskUpdate(task!.id.toString());
      }
    } catch (error) {
      console.error('完成任务失败:', error);
      message.error('完成任务失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 删除任务处理函数
  const handleDelete = async () => {
    try {
      setLoading(true);
      await taskService.deleteTask(task!.id.toString());
      message.success('任务已删除');
      
      if (onTaskUpdate) {
        onTaskUpdate(task!.id.toString());
      }
    } catch (error) {
      console.error('删除任务失败:', error);
      message.error('删除任务失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '未设置';
    return dayjs(dateString).format('YYYY-MM-DD HH:mm');
  };

  // 计算剩余天数
  const getRemainingDays = () => {
    if (!task?.dueDate) return null;
    
    const dueDate = dayjs(task.dueDate);
    const now = dayjs();
    const days = dueDate.diff(now, 'day');
    
    if (days < 0) {
      return <Text type="danger">已逾期 {Math.abs(days)} 天</Text>;
    } else if (days === 0) {
      return <Text type="warning">今天到期</Text>;
    } else {
      return <Text>剩余 {days} 天</Text>;
    }
  };

  // 获取任务状态显示
  const getStatusDisplay = () => {
    if (!task || !task.status) return null;
    
    const statusMap: Record<TaskStatus, { text: string, status: 'success' | 'processing' | 'default' | 'error' | 'warning' }> = {
      [TaskStatus.TODO]: { text: '待办', status: 'default' },
      [TaskStatus.IN_PROGRESS]: { text: '进行中', status: 'processing' },
      [TaskStatus.COMPLETED]: { text: '已完成', status: 'success' },
      [TaskStatus.CANCELLED]: { text: '已取消', status: 'error' }
    };
    
    const statusInfo = statusMap[task.status] || { text: String(task.status), status: 'default' };
    return <Badge status={statusInfo.status} text={statusInfo.text} />;
  };

  // 根据树木类型获取颜色
  const getTreeTypeColor = (treeType: TreeType): string => {
    const colorMap: Record<TreeType, string> = {
      [TreeType.OAK]: 'green',
      [TreeType.PINE]: 'cyan',
      [TreeType.MAPLE]: 'orange',
      [TreeType.PALM]: 'lime',
      [TreeType.APPLE]: 'red',
      [TreeType.WILLOW]: 'purple'
    };
    
    return colorMap[treeType] || 'blue';
  };
  
  // 获取树木类型的名称
  const getTreeTypeName = (treeType: TreeType): string => {
    const nameMap: Record<TreeType, string> = {
      [TreeType.OAK]: '橡树',
      [TreeType.PINE]: '松树',
      [TreeType.MAPLE]: '枫树',
      [TreeType.PALM]: '棕榈树',
      [TreeType.APPLE]: '苹果树',
      [TreeType.WILLOW]: '柳树'
    };
    
    return nameMap[treeType] || String(treeType);
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
                  <Tag color={getTreeTypeColor(task.treeType as TreeType)}>
                    {getTreeTypeName(task.treeType as TreeType)}
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
                  <Space>
                    <ClockCircleOutlined /> {formatDate(task.dueDate)}
                    {getRemainingDays()}
                  </Space>
                </Descriptions.Item>
              )}
              {task.progress !== undefined && (
                <Descriptions.Item label={<><AimOutlined /> 当前进度</>}>
                  {task.progress}%
                </Descriptions.Item>
              )}
              {task.type && (
                <Descriptions.Item label={<><FlagOutlined /> 任务类型</>}>
                  <Space>
                    <TaskTypeTag type={task.type} />
                    {task.treeType && (
                      <Tooltip title="该任务类型对应的树木">
                        <span>→</span>
                        <TreeTypeTag type={task.treeType as TreeType} />
                      </Tooltip>
                    )}
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>
            
            {/* 显示任务类型与树木类型对应关系 */}
            <Divider plain>任务类型与树木对应关系</Divider>
            <Card size="small" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <Text strong>当前任务类型：</Text>
                  {task.type && <TaskTypeTag type={task.type} />}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text strong>对应树木：</Text>
                  {task.treeType && <TreeTypeTag type={task.treeType as TreeType} />}
                </div>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                不同任务类型会对应不同的树木种类，完成任务后树木将完全生长
              </Text>
            </Card>
            
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
            {treeLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
              </div>
            ) : treeInfo ? (
              <Card size="small">
                <Descriptions size="small" bordered column={1}>
                  <Descriptions.Item label="树木类型">
                    <TreeTypeTag type={task.treeType as TreeType} />
                  </Descriptions.Item>
                  <Descriptions.Item label="生长阶段">
                    {treeInfo.stage}/4
                    <Progress percent={treeInfo.stage * 25} status="active" />
                  </Descriptions.Item>
                  <Descriptions.Item label="健康状态">
                    <Progress 
                      percent={treeInfo.healthState} 
                      status={
                        treeInfo.healthState > 75 ? 'success' : 
                        treeInfo.healthState > 50 ? 'normal' : 'exception'
                      }
                      strokeColor={
                        treeInfo.healthState > 75 ? '#52c41a' : 
                        treeInfo.healthState > 50 ? '#1890ff' : 
                        treeInfo.healthState > 25 ? '#faad14' : '#f5222d'
                      }
                    />
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ) : (
              <Text type="secondary">无关联树木</Text>
            )}
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