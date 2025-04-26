import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space, Tag } from 'antd';
import type { InputRef } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Task, TaskStatus, TaskPriority, TreeType } from '../types/Task';

const { Option } = Select;
const { TextArea } = Input;

interface TaskModalProps {
  visible: boolean;
  task?: Task;
  onCancel: () => void;
  onSave: (task: Task) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ visible, task, onCancel, onSave }) => {
  const [form] = Form.useForm();
  const [tags, setTags] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = React.useRef<InputRef>(null);

  useEffect(() => {
    if (visible && task) {
      form.setFieldsValue({
        ...task,
        dueDate: task.dueDate ? dayjs(task.dueDate) : undefined,
      });
      setTags(task.tags || []);
    } else if (visible) {
      form.resetFields();
      setTags([]);
    }
  }, [visible, task, form]);

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  const handleClose = (removedTag: string) => {
    const newTags = tags.filter(tag => tag !== removedTag);
    setTags(newTags);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const newTask: Task = {
        ...values,
        id: task?.id || Date.now().toString(),
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : undefined,
        tags,
        createdAt: task?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSave(newTask);
    });
  };

  // 树木类型中文映射
  const treeTypeNames: Record<string, string> = {
    [TreeType.OAK]: '橡树',
    [TreeType.PINE]: '松树',
    [TreeType.MAPLE]: '枫树',
    [TreeType.CHERRY]: '樱花树',
    [TreeType.WILLOW]: '柳树',
  };

  return (
    <Modal
      title={task ? '编辑任务' : '新建任务'}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          保存
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: '请输入任务标题' }]}
        >
          <Input placeholder="任务标题" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <TextArea rows={4} placeholder="任务描述（可选）" />
        </Form.Item>
        <Form.Item name="status" label="状态" rules={[{ required: true }]}>
          <Select placeholder="选择状态">
            <Option value={TaskStatus.TODO}>待办</Option>
            <Option value={TaskStatus.IN_PROGRESS}>进行中</Option>
            <Option value={TaskStatus.COMPLETED}>已完成</Option>
          </Select>
        </Form.Item>
        <Form.Item name="priority" label="优先级" rules={[{ required: true }]}>
          <Select placeholder="选择优先级">
            <Option value={TaskPriority.LOW}>低</Option>
            <Option value={TaskPriority.MEDIUM}>中</Option>
            <Option value={TaskPriority.HIGH}>高</Option>
          </Select>
        </Form.Item>
        <Form.Item name="dueDate" label="截止日期">
          <DatePicker style={{ width: '100%' }} placeholder="选择截止日期（可选）" />
        </Form.Item>
        
        {/* 树木类型选择器 */}
        <Form.Item name="treeType" label="关联树木类型">
          <Select placeholder="选择树木类型（可选）" allowClear>
            {Object.entries(TreeType).map(([key, value]) => (
              <Option key={value} value={value}>
                {treeTypeNames[value] || key}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        {/* 成长阶段选择器（只有当有树木类型时才显示） */}
        <Form.Item 
          name="growthStage" 
          label="成长阶段" 
          dependencies={['treeType']}
          hidden={!form.getFieldValue('treeType')}
        >
          <Select placeholder="设置成长阶段">
            <Option value={1}>第1阶段 - 幼苗</Option>
            <Option value={2}>第2阶段 - 小树</Option>
            <Option value={3}>第3阶段 - 成长中</Option>
            <Option value={4}>第4阶段 - 将成熟</Option>
            <Option value={5}>第5阶段 - 成熟</Option>
          </Select>
        </Form.Item>
        
        <Form.Item label="标签">
          <div>
            {tags.map(tag => (
              <Tag
                closable
                key={tag}
                style={{ marginBottom: 8 }}
                onClose={() => handleClose(tag)}
              >
                {tag}
              </Tag>
            ))}
            {inputVisible ? (
              <Input
                ref={inputRef}
                type="text"
                size="small"
                style={{ width: 78 }}
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputConfirm}
                onPressEnter={handleInputConfirm}
              />
            ) : (
              <Tag onClick={showInput} style={{ background: '#fff', borderStyle: 'dashed' }}>
                <PlusOutlined /> 新增标签
              </Tag>
            )}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskModal; 