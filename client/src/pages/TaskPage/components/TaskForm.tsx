import React, { useEffect } from 'react';
import { Form, Input, Modal, DatePicker, Select, Button, InputNumber } from 'antd';
import { TaskPriority, TaskType } from '../../../types/Task';
import { TreeType } from '../../../types/Tree';
import dayjs from 'dayjs';

interface TaskFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialValues?: any;
  loading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ visible, onCancel, onSubmit, initialValues, loading }) => {
  const [form] = Form.useForm();
  
  // 表单提交
  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSubmit(values);
    }).catch(info => {
      console.log('验证失败:', info);
    });
  };
  
  // 重置表单
  useEffect(() => {
    if (visible && form) {
      form.resetFields();
      
      // 如果有初始值，设置表单值
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : undefined
        });
      }
    }
  }, [visible, initialValues, form]);
  
  return (
    <Modal
      title={initialValues ? "编辑任务" : "创建任务"}
      visible={visible}
      confirmLoading={loading}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {initialValues ? "保存" : "创建"}
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues || {}}
      >
        {/* 任务标题 */}
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: '请输入任务标题' }]}
        >
          <Input placeholder="任务标题" />
        </Form.Item>
        
        {/* 任务描述 */}
        <Form.Item
          name="description"
          label="描述"
        >
          <Input.TextArea placeholder="任务描述" rows={3} />
        </Form.Item>
        
        {/* 任务类型 */}
        <Form.Item
          name="type"
          label="类型"
          rules={[{ required: true, message: '请选择任务类型' }]}
        >
          <Select placeholder="选择任务类型">
            <Select.Option value={TaskType.NORMAL}>普通任务</Select.Option>
            <Select.Option value={TaskType.WORK}>工作任务</Select.Option>
            <Select.Option value={TaskType.LEARNING}>学习任务</Select.Option>
            <Select.Option value={TaskType.PROJECT}>项目任务</Select.Option>
            <Select.Option value={TaskType.RECURRING}>重复任务</Select.Option>
            <Select.Option value={TaskType.LEISURE}>休闲任务</Select.Option>
          </Select>
        </Form.Item>
        
        {/* 任务优先级 */}
        <Form.Item
          name="priority"
          label="优先级"
          rules={[{ required: true, message: '请选择任务优先级' }]}
        >
          <Select placeholder="选择优先级">
            <Select.Option value={TaskPriority.LOW}>低</Select.Option>
            <Select.Option value={TaskPriority.MEDIUM}>中</Select.Option>
            <Select.Option value={TaskPriority.HIGH}>高</Select.Option>
            <Select.Option value={TaskPriority.URGENT}>紧急</Select.Option>
          </Select>
        </Form.Item>
        
        {/* 截止日期 */}
        <Form.Item
          name="dueDate"
          label="截止日期"
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm" placeholder="选择截止日期" style={{ width: '100%' }} />
        </Form.Item>
        
        {/* 标签 */}
        <Form.Item
          name="tags"
          label="标签"
        >
          <Select mode="tags" placeholder="添加标签" style={{ width: '100%' }} />
        </Form.Item>
        
        {/* 树木类型 */}
        <Form.Item
          name="treeType"
          label="树木类型"
          rules={[{ required: true, message: '请选择树木类型' }]}
        >
          <Select placeholder="选择树木类型">
            <Select.Option value={TreeType.OAK}>橡树</Select.Option>
            <Select.Option value={TreeType.PINE}>松树</Select.Option>
            <Select.Option value={TreeType.MAPLE}>枫树</Select.Option>
            <Select.Option value={TreeType.CHERRY}>樱花树</Select.Option>
            <Select.Option value={TreeType.PALM}>棕榈树</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskForm; 