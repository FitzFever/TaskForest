import React from 'react';
import { Modal, Form, Input, DatePicker, Select, InputNumber } from 'antd';
import { TaskType, TaskPriority, TreeType } from '@/types/task';
import styles from './styles.module.css';

interface TaskFormProps {
  visible: boolean;
  loading?: boolean;
  initialValues?: any;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  visible,
  loading,
  initialValues,
  onCancel,
  onSubmit
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit({
        ...values,
        dueDate: values.dueDate.toISOString(),
      });
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Modal
      title={initialValues ? "编辑任务" : "创建新任务"}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        className={styles.taskForm}
      >
        <Form.Item
          name="title"
          label="任务标题"
          rules={[{ required: true, message: '请输入任务标题' }]}
        >
          <Input placeholder="请输入任务标题" />
        </Form.Item>

        <Form.Item
          name="description"
          label="任务描述"
        >
          <Input.TextArea 
            placeholder="请输入任务描述" 
            rows={4}
          />
        </Form.Item>

        <div className={styles.formRow}>
          <Form.Item
            name="type"
            label="任务类型"
            rules={[{ required: true, message: '请选择任务类型' }]}
          >
            <Select placeholder="请选择任务类型">
              {Object.entries(TaskType).map(([key, value]) => (
                <Select.Option key={key} value={value}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select placeholder="请选择优先级">
              {Object.entries(TaskPriority).map(([key, value]) => (
                <Select.Option key={key} value={value}>
                  {key}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div className={styles.formRow}>
          <Form.Item
            name="dueDate"
            label="截止日期"
            rules={[{ required: true, message: '请选择截止日期' }]}
          >
            <DatePicker 
              showTime 
              placeholder="请选择截止日期"
              className={styles.datePicker}
            />
          </Form.Item>

          <Form.Item
            name="treeType"
            label="树木类型"
            rules={[{ required: true, message: '请选择树木类型' }]}
          >
            <Select placeholder="请选择树木类型">
              {Object.entries(TreeType).map(([key, value]) => (
                <Select.Option key={key} value={value}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          name="tags"
          label="标签"
        >
          <Select
            mode="tags"
            placeholder="请输入标签"
            className={styles.tagSelect}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskForm; 