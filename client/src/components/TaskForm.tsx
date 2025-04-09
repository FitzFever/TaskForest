import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, message, Space, Divider } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { TaskStatus, TaskPriority, Task, CreateTaskData } from '../types/Task';
import * as taskService from '../services/taskService';
import taskAdapter from '../adapters/taskAdapter';
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
      // 将日期字符串转换为dayjs对象
      const values = {
        ...initialValues,
        dueDate: initialValues.deadline ? dayjs(initialValues.deadline) : undefined,
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
      
      // 添加调试日志
      console.log('环境变量配置:', {
        USE_MOCK: taskService.USE_MOCK,
        API_URL: import.meta.env.VITE_REACT_APP_DEV_API_URL,
        NODE_ENV: import.meta.env.MODE
      });
      
      // 格式化日期
      const formattedValues = {
        ...values,
        deadline: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : undefined,
      };

      // 删除dueDate字段，因为我们已经转化为deadline
      delete formattedValues.dueDate;

      console.log('提交的表单数据:', formattedValues);
      
      let task: Task;

      if (isEditMode && initialValues) {
        // 将前端任务数据转换为API格式
        const apiTaskData = taskAdapter.taskToUpdateRequest({
          ...initialValues,
          ...formattedValues
        });
        
        console.log('发送更新请求:', apiTaskData);
        
        // 更新任务
        const updatedApiTask = await taskService.updateTask(initialValues.id.toString(), apiTaskData);
        
        // 将API返回数据转换为前端格式
        task = taskAdapter.apiTaskToFrontendTask(updatedApiTask);
        message.success({
          content: '任务更新成功',
          className: 'custom-success-message',
          icon: <SaveOutlined style={{ color: '#52c41a' }} />
        });
      } else {
        // 创建任务数据对象 (CreateTaskData)
        const createTaskData: CreateTaskData = {
          title: formattedValues.title,
          description: formattedValues.description,
          priority: formattedValues.priority,
          deadline: formattedValues.deadline,
          treeType: formattedValues.treeType
        };
        
        // 转换为API请求格式
        const apiTaskData = taskAdapter.createTaskDataToRequest(createTaskData);
        
        console.log('发送创建请求:', apiTaskData);
        
        try {
          // 创建任务
          const newApiTask = await taskService.createTask(apiTaskData);
          
          // 将API返回数据转换为前端格式
          task = taskAdapter.apiTaskToFrontendTask(newApiTask);
          message.success({
            content: '任务创建成功！树木已开始生长',
            className: 'custom-success-message',
            duration: 3,
            icon: <PlusOutlined style={{ color: '#52c41a' }} />
          });
          
          // 重置表单
          if (!isEditMode) {
            form.resetFields();
          }
          
          // 调用成功回调
          if (onSuccess) {
            onSuccess(task);
          }
        } catch (createError: any) {
          console.error('API创建任务失败:', createError);
          
          if (createError.response) {
            // 服务器返回了错误信息
            const errorMsg = createError.response.data?.message || '服务器响应错误';
            message.error(`创建任务失败: ${errorMsg}`);
          } else if (createError.request) {
            // 请求已发出但没有收到响应
            message.error('创建任务失败: 服务器无响应，请检查网络连接');
          } else {
            // 请求设置时出错
            message.error(`创建任务失败: ${createError.message || '未知错误'}`);
          }
          
          return; // 创建失败，直接返回
        }
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
        status: TaskStatus.TODO,
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
      >
        <Select>
          <Select.Option value={TaskPriority.LOW}>{TaskPriority.LOW}</Select.Option>
          <Select.Option value={TaskPriority.MEDIUM}>{TaskPriority.MEDIUM}</Select.Option>
          <Select.Option value={TaskPriority.HIGH}>{TaskPriority.HIGH}</Select.Option>
          <Select.Option value={TaskPriority.URGENT}>{TaskPriority.URGENT}</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="dueDate"
        label="截止日期"
      >
        <DatePicker 
          style={{ width: '100%' }} 
          placeholder="选择截止日期"
          format="YYYY-MM-DD"
          disabledDate={(current) => {
            // 不能选择过去的日期
            return current && current < dayjs().startOf('day');
          }}
        />
      </Form.Item>

      <Form.Item
        name="treeType"
        label="树木类型"
      >
        <Select placeholder="选择树木类型">
          {Object.values(TreeType).map(type => (
            <Select.Option key={type} value={type}>{type}</Select.Option>
          ))}
        </Select>
      </Form.Item>

      {isEditMode && (
        <Form.Item
          name="status"
          label="状态"
        >
          <Select>
            <Select.Option value={TaskStatus.TODO}>{TaskStatus.TODO}</Select.Option>
            <Select.Option value={TaskStatus.IN_PROGRESS}>{TaskStatus.IN_PROGRESS}</Select.Option>
            <Select.Option value={TaskStatus.COMPLETED}>{TaskStatus.COMPLETED}</Select.Option>
          </Select>
        </Form.Item>
      )}

      <Divider />

      <Form.Item>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={isEditMode ? <SaveOutlined /> : <PlusOutlined />}
            disabled={loading}
          >
            {loading ? (isEditMode ? '保存中...' : '创建中...') : (isEditMode ? '保存修改' : '创建任务')}
          </Button>
          <Button onClick={onCancel} disabled={loading}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default TaskForm; 