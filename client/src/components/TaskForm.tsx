import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, message, Space, Divider, Tooltip, Checkbox, Tag, Card, List } from 'antd';
import { PlusOutlined, SaveOutlined, InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
const { Text } = Typography;
import dayjs from 'dayjs';
import { TaskStatus, TaskPriority, Task, TaskType } from '../types/Task';
import * as taskService from '../services/taskService';
import { TreeType } from '../types/Tree';
import { getDefaultTreeTypeForTask } from '../services/constantsService';

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
    TreeType.WILLOW,
    TreeType.MAPLE,
    TreeType.PALM,
    TreeType.APPLE
  ]);
  
  // 添加自动选择树木类型的状态
  const [autoSelectTreeType, setAutoSelectTreeType] = useState(true);

  const isEditMode = type === 'edit';

  // 当初始值改变时重置表单
  useEffect(() => {
    if (initialValues) {
      const values = {
        ...initialValues,
        dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : undefined,
      };
      form.setFieldsValue(values);
      setAutoSelectTreeType(false); // 编辑模式默认不自动选择树木类型
    } else {
      form.resetFields();
      setAutoSelectTreeType(true); // 创建模式默认自动选择
    }
  }, [initialValues, form]);

  // 监听任务类型变化，自动更新树木类型
  const handleTaskTypeChange = (value: TaskType) => {
    if (autoSelectTreeType) {
      const defaultTreeType = getDefaultTreeTypeForTask(value);
      form.setFieldsValue({ treeType: defaultTreeType });
    }
  };

  // 提交表单
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // 格式化表单数据
      const formData = {
        title: values.title,
        description: values.description || '',
        type: values.type || TaskType.NORMAL,
        priority: values.priority || TaskPriority.MEDIUM,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DDTHH:mm:ssZ') : undefined,
        tags: values.tags || [],
        treeType: values.treeType || getDefaultTreeTypeForTask(values.type || TaskType.NORMAL)
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
        type: TaskType.NORMAL,
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
        name="type"
        label="任务类型"
        rules={[{ required: true, message: '请选择任务类型' }]}
      >
        <Select onChange={handleTaskTypeChange}>
          <Select.Option value={TaskType.NORMAL}>
            普通日常任务 <Tag color="green">橡树</Tag>
          </Select.Option>
          <Select.Option value={TaskType.RECURRING}>
            定期重复任务 <Tag color="cyan">松树</Tag>
          </Select.Option>
          <Select.Option value={TaskType.PROJECT}>
            长期项目任务 <Tag color="magenta">柳树</Tag>
          </Select.Option>
          <Select.Option value={TaskType.LEARNING}>
            学习类任务 <Tag color="volcano">苹果树</Tag>
          </Select.Option>
          <Select.Option value={TaskType.WORK}>
            工作类任务 <Tag color="orange">枫树</Tag>
          </Select.Option>
          <Select.Option value={TaskType.LEISURE}>
            休闲类任务 <Tag color="lime">棕榈树</Tag>
          </Select.Option>
        </Select>
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
        name="tags"
        label="标签"
      >
        <Select
          mode="tags"
          style={{ width: '100%' }}
          placeholder="请输入标签，按回车确认"
          tokenSeparators={[',']}
        />
      </Form.Item>

      <Form.Item
        label={
          <span>
            树木类型
            <Tooltip title="树木类型将决定您任务完成后在森林中种植的树木种类">
              <InfoCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </span>
        }
      >
        <Form.Item 
          name="treeType"
          rules={[{ required: true, message: '请选择树木类型' }]}
          style={{ display: autoSelectTreeType ? 'none' : 'block' }}
        >
          <Select 
            disabled={autoSelectTreeType}
            placeholder="选择树木类型"
          >
            <Select.Option value={TreeType.OAK}>橡树 (普通日常任务)</Select.Option>
            <Select.Option value={TreeType.PINE}>松树 (定期重复任务)</Select.Option>
            <Select.Option value={TreeType.WILLOW}>柳树 (长期项目任务)</Select.Option>
            <Select.Option value={TreeType.APPLE}>苹果树 (学习类任务)</Select.Option>
            <Select.Option value={TreeType.MAPLE}>枫树 (工作类任务)</Select.Option>
            <Select.Option value={TreeType.PALM}>棕榈树 (休闲类任务)</Select.Option>
          </Select>
        </Form.Item>
      </Form.Item>

      <Form.Item>
        <Checkbox 
          checked={autoSelectTreeType} 
          onChange={(e) => setAutoSelectTreeType(e.target.checked)}
        >
          根据任务类型自动选择树木类型
        </Checkbox>
        <Tooltip title="开启后将根据任务类型自动选择对应的树木类型，可以在创建后修改">
          <QuestionCircleOutlined style={{ marginLeft: 8 }} />
        </Tooltip>
      </Form.Item>

      {/* 添加任务类型与树木类型对应关系说明 */}
      <Form.Item label={null}>
        <Card size="small" title="任务类型与树木对应关系" style={{ marginBottom: 16 }}>
          <List
            size="small"
            dataSource={[
              { task: '普通日常任务', tree: '橡树', taskType: TaskType.NORMAL, treeType: TreeType.OAK, color: 'green' },
              { task: '定期重复任务', tree: '松树', taskType: TaskType.RECURRING, treeType: TreeType.PINE, color: 'cyan' },
              { task: '长期项目任务', tree: '柳树', taskType: TaskType.PROJECT, treeType: TreeType.WILLOW, color: 'magenta' },
              { task: '学习类任务', tree: '苹果树', taskType: TaskType.LEARNING, treeType: TreeType.APPLE, color: 'volcano' },
              { task: '工作类任务', tree: '枫树', taskType: TaskType.WORK, treeType: TreeType.MAPLE, color: 'orange' },
              { task: '休闲类任务', tree: '棕榈树', taskType: TaskType.LEISURE, treeType: TreeType.PALM, color: 'lime' }
            ]}
            renderItem={item => (
              <List.Item>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <div style={{ flex: 1 }}>{item.task}</div>
                  <div style={{ textAlign: 'right' }}>
                    <Tag color={item.color}>{item.tree}</Tag>
                  </div>
                </div>
              </List.Item>
            )}
          />
          <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
            选择任务类型后，系统将自动为您选择对应的树木类型
          </Text>
        </Card>
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