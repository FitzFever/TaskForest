import React from 'react';
import { Table, Tag, Space, Button, Tooltip } from 'antd';
import { 
  CheckCircleOutlined, 
  DeleteOutlined, 
  EditOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { TaskStatus, TaskPriority } from '@/types/task';
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
          {tags.map((tag) => (
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
          <span>类型: {record.treeType}</span>
          <span>阶段: {record.growthStage}/4</span>
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
    </div>
  );
};

export default TaskList; 