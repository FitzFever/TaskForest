import React, { useState } from 'react';
import { Table, Tag, Space, Button, Tooltip, Drawer, Progress } from 'antd';
import { 
  CheckCircleOutlined, 
  DeleteOutlined, 
  EditOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { TaskStatus, TaskPriority } from '../../../../types/Task';
import TreeHealthPanel from '../../../../components/TreeHealthPanel';
import { getHealthColor, getHealthCategoryName } from '../../../../utils/healthUtils';
import styles from './styles.module.css';

interface TaskListProps {
  tasks: any[];
  loading?: boolean;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading,
  onStatusChange,
  onComplete,
  onDelete
}) => {
  // 新增：用于控制健康面板抽屉
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [healthPanelVisible, setHealthPanelVisible] = useState(false);

  // 显示健康面板
  const showHealthPanel = (taskId: string) => {
    setSelectedTaskId(taskId);
    setHealthPanelVisible(true);
  };

  // 关闭健康面板
  const closeHealthPanel = () => {
    setHealthPanelVisible(false);
  };

  // 处理任务进度更新
  const handleProgressUpdate = (taskId: string, progress: number) => {
    console.log(`任务${taskId}进度更新为${progress}%`);
    // 此处可添加更新任务列表的逻辑
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'default';
      case TaskStatus.IN_PROGRESS:
        return 'processing';
      case TaskStatus.COMPLETED:
        return 'success';
      case TaskStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return '#f5222d';
      case TaskPriority.HIGH:
        return '#fa8c16';
      case TaskPriority.MEDIUM:
        return '#faad14';
      case TaskPriority.LOW:
        return '#52c41a';
      default:
        return '#d9d9d9';
    }
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <div className={styles.titleCell}>
          <span>{text}</span>
          {record.description && (
            <Tooltip title={record.description}>
              <InfoCircleOutlined className={styles.infoIcon} />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: number) => (
        <Tag color={getPriorityColor(priority)}>
          {TaskPriority[priority]}
        </Tag>
      ),
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => (
        <Space>
          <ClockCircleOutlined />
          {new Date(date).toLocaleString()}
        </Space>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space size={[0, 8]} wrap>
          {tags && tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '树木状态',
      key: 'treeStatus',
      render: (_: any, record: any) => (
        <div className={styles.treeStatus}>
          <div style={{ marginBottom: 4 }}>
            <Space>
              <span>类型: {record.treeType || '橡树'}</span>
              <span>阶段: {record.growthStage || 0}/4</span>
            </Space>
          </div>

          {/* 添加健康状态栏 */}
          {record.healthState !== undefined && (
            <div className={styles.healthStatus}>
              <Tooltip title={`健康状态: ${record.healthState || 100}%`}>
                <Progress 
                  percent={record.healthState || 100} 
                  size="small" 
                  showInfo={false}
                  strokeColor={getHealthColor(record.healthState || 100)}
                  style={{ marginRight: 10, width: 80 }}
                />
              </Tooltip>
              
              <Space>
                {record.healthCategory && (
                  <Tag color={getHealthColor(record.healthState || 100)}>
                    {getHealthCategoryName(record.healthCategory)}
                  </Tag>
                )}
                <Button 
                  type="link" 
                  size="small" 
                  icon={<HeartOutlined />} 
                  onClick={() => showHealthPanel(record.id)}
                >
                  查看详情
                </Button>
              </Space>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          {record.status !== TaskStatus.COMPLETED && (
            <Tooltip title="完成任务">
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                onClick={() => onComplete(record.id)}
              />
            </Tooltip>
          )}
          <Tooltip title="删除任务">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.taskList}>
      <Table
        columns={columns}
        dataSource={tasks}
        loading={loading}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 个任务`
        }}
      />

      {/* 添加健康状态面板抽屉 */}
      <Drawer
        title="树木健康状态详情"
        placement="right"
        onClose={closeHealthPanel}
        visible={healthPanelVisible}
        width={350}
      >
        {selectedTaskId && (
          <TreeHealthPanel
            taskId={selectedTaskId}
            onProgressUpdate={handleProgressUpdate}
          />
        )}
      </Drawer>
    </div>
  );
};

export default TaskList; 