import React, { useState } from 'react';
import { Card, Form, Switch, Select, Radio, Button, Slider, Divider, message } from 'antd';
import { SaveOutlined, UndoOutlined } from '@ant-design/icons';

const { Option } = Select;

// 默认设置
const DEFAULT_SETTINGS = {
  theme: 'light',
  notificationsEnabled: true,
  dueDateReminderHours: 24,
  dailyDigestEnabled: true,
  taskListView: 'kanban',
  defaultSortField: 'dueDate',
  defaultSortOrder: 'asc',
  renderQuality: 'high',
  autoRotate: true,
  weatherEffects: true,
  ambientSound: true,
};

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 处理保存设置
  const handleSaveSettings = async (values: any) => {
    setLoading(true);
    try {
      // 这里应该调用API保存设置
      console.log('保存设置:', values);
      message.success('设置已保存');
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('保存设置失败');
    } finally {
      setLoading(false);
    }
  };

  // 重置设置
  const handleResetSettings = () => {
    form.setFieldsValue(DEFAULT_SETTINGS);
    message.info('设置已重置');
  };

  return (
    <Card title="应用设置">
      <Form
        form={form}
        layout="vertical"
        initialValues={DEFAULT_SETTINGS}
        onFinish={handleSaveSettings}
        style={{ maxWidth: '800px', margin: '0 auto' }}
      >
        <Divider orientation="left">界面设置</Divider>
        
        <Form.Item name="theme" label="主题">
          <Radio.Group>
            <Radio.Button value="light">浅色</Radio.Button>
            <Radio.Button value="dark">深色</Radio.Button>
            <Radio.Button value="system">跟随系统</Radio.Button>
          </Radio.Group>
        </Form.Item>
        
        <Form.Item name="taskListView" label="任务列表视图">
          <Radio.Group>
            <Radio.Button value="list">列表视图</Radio.Button>
            <Radio.Button value="kanban">看板视图</Radio.Button>
            <Radio.Button value="calendar">日历视图</Radio.Button>
          </Radio.Group>
        </Form.Item>
        
        <Form.Item name="defaultSortField" label="默认排序字段">
          <Select>
            <Option value="dueDate">截止日期</Option>
            <Option value="priority">优先级</Option>
            <Option value="createdAt">创建时间</Option>
            <Option value="title">标题</Option>
          </Select>
        </Form.Item>
        
        <Form.Item name="defaultSortOrder" label="默认排序方向">
          <Radio.Group>
            <Radio.Button value="asc">升序</Radio.Button>
            <Radio.Button value="desc">降序</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Divider orientation="left">通知设置</Divider>
        
        <Form.Item name="notificationsEnabled" valuePropName="checked" label="启用通知">
          <Switch />
        </Form.Item>
        
        <Form.Item name="dueDateReminderHours" label="截止日期提醒（提前小时数）">
          <Slider min={1} max={72} marks={{ 1: '1小时', 24: '1天', 48: '2天', 72: '3天' }} />
        </Form.Item>
        
        <Form.Item name="dailyDigestEnabled" valuePropName="checked" label="启用每日摘要">
          <Switch />
        </Form.Item>

        <Divider orientation="left">森林设置</Divider>
        
        <Form.Item name="renderQuality" label="渲染质量">
          <Radio.Group>
            <Radio.Button value="low">低</Radio.Button>
            <Radio.Button value="medium">中</Radio.Button>
            <Radio.Button value="high">高</Radio.Button>
          </Radio.Group>
        </Form.Item>
        
        <Form.Item name="autoRotate" valuePropName="checked" label="自动旋转场景">
          <Switch />
        </Form.Item>
        
        <Form.Item name="weatherEffects" valuePropName="checked" label="天气效果">
          <Switch />
        </Form.Item>
        
        <Form.Item name="ambientSound" valuePropName="checked" label="环境音效">
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            icon={<SaveOutlined />}
            style={{ marginRight: '10px' }}
          >
            保存设置
          </Button>
          <Button 
            onClick={handleResetSettings}
            icon={<UndoOutlined />}
          >
            恢复默认
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Settings; 