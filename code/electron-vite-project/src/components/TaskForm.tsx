import { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Modal, message } from 'antd';
import { TaskService, CategoryService } from '../lib/db';
import type { Category } from '@prisma/client';

const { TextArea } = Input;
const { Option } = Select;

interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const treeTypes = [
  { value: 'oak', label: '橡树 (基础/常规任务)' },
  { value: 'pine', label: '松树 (长期任务)' },
  { value: 'cherry', label: '樱花树 (创意任务)' },
  { value: 'palm', label: '棕榈树 (休闲任务)' },
  { value: 'apple', label: '苹果树 (学习知识任务)' },
  { value: 'maple', label: '枫树 (健康任务)' },
  { value: 'willow', label: '柳树 (社交任务)' },
  { value: 'rubber', label: '橡胶树 (职业任务)' },
];

const TaskForm: React.FC<TaskFormProps> = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // 获取所有分类
    const fetchCategories = async () => {
      try {
        const data = await CategoryService.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('获取分类失败:', error);
        message.error('获取任务分类失败');
      }
    };

    if (visible) {
      fetchCategories();
    }
  }, [visible]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // 处理日期格式
      const formattedValues = {
        ...values,
        deadline: values.deadline ? values.deadline.toDate() : undefined,
      };

      // 创建任务
      await TaskService.createTask(formattedValues);
      
      // 创建对应的树
      await window.electron.ipcRenderer.invoke('create-tree', {
        type: values.treeType,
        taskId: formattedValues.id,
        growthStage: 1,
        position: `${Math.random() * 10 - 5},0,${Math.random() * 10 - 5}`, // 随机位置
      });

      message.success('任务创建成功！');
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error('创建任务失败:', error);
      message.error('创建任务失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="创建新任务"
      open={visible}
      onCancel={onClose}
      footer={null}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="title"
          label="任务名称"
          rules={[{ required: true, message: '请输入任务名称' }]}
        >
          <Input placeholder="请输入任务名称" />
        </Form.Item>

        <Form.Item
          name="description"
          label="任务描述"
        >
          <TextArea rows={4} placeholder="请输入任务描述" />
        </Form.Item>

        <Form.Item
          name="treeType"
          label="任务类型（树木种类）"
          rules={[{ required: true, message: '请选择任务类型' }]}
        >
          <Select placeholder="请选择任务类型">
            {treeTypes.map(type => (
              <Option key={type.value} value={type.value}>{type.label}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="任务分类"
        >
          <Select placeholder="请选择任务分类" allowClear>
            {categories.map(category => (
              <Option key={category.id} value={category.id}>
                <span style={{ 
                  display: 'inline-block', 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: category.color,
                  marginRight: '8px',
                  borderRadius: '2px'
                }}></span>
                {category.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="deadline"
          label="截止日期"
        >
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="priority"
          label="优先级"
          initialValue="中"
        >
          <Select>
            <Option value="低">低</Option>
            <Option value="中">中</Option>
            <Option value="高">高</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" htmlType="submit" loading={loading}>创建任务</Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskForm; 