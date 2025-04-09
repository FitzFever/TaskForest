import React from 'react';
import { Card, Tag, Space, Typography } from 'antd';
import { TagsOutlined } from '@ant-design/icons';
import { Task } from '../types/Task';

const { Title, Text } = Typography;

interface TagStatsProps {
  tasks: Task[];
  onTagClick: (tag: string) => void;
}

/**
 * 标签统计组件 - 显示最常用的标签
 */
const TagStats: React.FC<TagStatsProps> = ({ tasks, onTagClick }) => {
  // 计算标签统计
  const getTagStats = () => {
    const tagCounts: Record<string, number> = {};
    tasks.forEach(task => {
      if (task.tags && task.tags.length > 0) {
        task.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    // 转换为数组并排序
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // 只显示前10个
  };
  
  const tagStats = getTagStats();
  
  if (tagStats.length === 0) {
    return null;
  }
  
  return (
    <Card 
      title={
        <Space>
          <TagsOutlined />
          <span>常用标签</span>
        </Space>
      }
      size="small"
      style={{ marginBottom: '16px' }}
    >
      <Space wrap>
        {tagStats.map(({ tag, count }) => (
          <Tag 
            key={tag}
            color="blue"
            style={{ cursor: 'pointer' }}
            onClick={() => onTagClick(tag)}
          >
            {tag} ({count})
          </Tag>
        ))}
      </Space>
    </Card>
  );
};

export default TagStats; 