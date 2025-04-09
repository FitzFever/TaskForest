import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, message, Space, Divider } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { TaskStatus, TaskPriority, Task } from '../types/Task';
import * as taskService from '../services/taskService';
import { TreeType } from '../types/Tree';

// 表单类型: 'create' | 'edit'
type FormType = 'create' | 'edit';

// 任务表单属性接口
interface TaskFormProps {
  type: FormType;
  initialValues?: Task;
  onSuccess?: (task: Task) => void;
  onCancel?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  type,
  initialValues,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [treeTypes, setTreeTypes] = useState<string[]>([
    TreeType.OAK, 
    TreeType.PINE,
    TreeType.CHERRY,
    TreeType.MAPLE,
    TreeType.PALM
  ]);

  const isEditMode = type === 'edit';

  // 当初始值改变时重置表单
  useEffect(() => {
    if (initialValues) {
      const values = {
        ...initialValues,
        dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : undefined,
      };
      form.setFieldsValue(values);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  // 提交表单
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // 格式化表单数据
      const formData = {
        title: values.title,
        description: values.description || '',
        type: values.type || 'NORMAL',
        priority: values.priority || TaskPriority.MEDIUM,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DDTHH:mm:ssZ') : undefined,
        tags: values.tags || [],
        treeType: values.treeType || TreeType.OAK
      };

      if (isEditMode && initialValues) {
        // 更新任务
        const updateResponse = await taskService.updateTask(initialValues.id.toString(), formData);
        if (updateResponse && updateResponse.data && updateResponse.data.code === 200) {
          message.success('任务更新成功');
        } else {
          throw new Error('更新任务失败');
        }
      } else {
        // 创建任务
        const response = await taskService.createTask(formData);
        // 检查响应状态是200或201
        if (response && response.data && (response.data.code === 200 || response.data.code === 201)) {
          message.success('任务创建成功！树木已开始生长');
          form.resetFields();
        } else {
          throw new Error('创建任务失败');
        }
      }

      // 调用成功回调
      if (onSuccess) {
        onSuccess(formData as Task);
      }
    } catch (error: any) {
      console.error('提交任务失败:', error);
      const errorMessage = error.response?.data?.message || error.message || '提交任务失败，请重试';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        type: 'NORMAL',
        priority: TaskPriority.MEDIUM,
        treeType: TreeType.OAK
      }}
    >
      <Form.Item
        name="title"
        label="任务标题"
        rules={[{ required: true, message: '请输入任务标题' }]}
      >
        <Input placeholder="请输入任务标题" maxLength={50} />
      </Form.Item>

      <Form.Item
        name="description"
        label="任务描述"
      >
        <Input.TextArea 
          placeholder="请输入任务描述" 
          rows={4} 
          maxLength={500}
          showCount
        />
      </Form.Item>

      <Form.Item
        name="priority"
        label="优先级"
        rules={[{ required: true, message: '请选择优先级' }]}
      >
        <Select>
          <Select.Option value={TaskPriority.LOW}>低优先级</Select.Option>
          <Select.Option value={TaskPriority.MEDIUM}>中优先级</Select.Option>
          <Select.Option value={TaskPriority.HIGH}>高优先级</Select.Option>
          <Select.Option value={TaskPriority.URGENT}>紧急</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="dueDate"
        label="截止日期"
        rules={[{ required: true, message: '请选择截止日期' }]}
      >
        <DatePicker 
          showTime 
          format="YYYY-MM-DD HH:mm"
          placeholder="选择截止日期和时间"
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="treeType"
        label="树木类型"
        rules={[{ required: true, message: '请选择树木类型' }]}
      >
        <Select>
          <Select.Option value={TreeType.OAK}>橡树</Select.Option>
          <Select.Option value={TreeType.PINE}>松树</Select.Option>
          <Select.Option value={TreeType.CHERRY}>樱花树</Select.Option>
          <Select.Option value={TreeType.MAPLE}>枫树</Select.Option>
          <Select.Option value={TreeType.PALM}>棕榈树</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEditMode ? '保存修改' : '创建任务'}
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default TaskForm; 