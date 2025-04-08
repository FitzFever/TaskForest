import React from 'react';
import { 
  Form, 
  Switch, 
  Radio, 
  Slider, 
  Button, 
  Card, 
  Divider, 
  Typography,
  Space
} from 'antd';
import { useSettingsStore } from '../store';
import { ThemeType, TaskViewType, RenderQuality } from '../types/Settings';

const { Title, Text } = Typography;

const SettingsPanel: React.FC = () => {
  const { 
    settings, 
    setTheme, 
    setNotifications, 
    setDueDateReminder, 
    setDailyDigest,
    setTaskListView,
    setSortField,
    setSortOrder,
    setRenderQuality,
    setAutoRotate,
    setWeatherEffects,
    setAmbientSound,
    resetSettings
  } = useSettingsStore();

  // 处理主题切换
  const handleThemeChange = (e: any) => {
    setTheme(e.target.value);
  };

  // 处理任务视图切换
  const handleTaskViewChange = (e: any) => {
    setTaskListView(e.target.value);
  };

  // 处理渲染质量切换
  const handleRenderQualityChange = (e: any) => {
    setRenderQuality(e.target.value);
  };

  // 处理表单重置
  const handleReset = () => {
    resetSettings();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Title level={2}>应用设置</Title>
      
      <Form layout="vertical">
        {/* 主题设置 */}
        <Card title="外观与主题" style={{ marginBottom: '20px' }}>
          <Form.Item label="应用主题">
            <Radio.Group 
              value={settings.theme} 
              onChange={handleThemeChange}
            >
              <Radio.Button value={ThemeType.LIGHT}>浅色</Radio.Button>
              <Radio.Button value={ThemeType.DARK}>深色</Radio.Button>
              <Radio.Button value={ThemeType.SYSTEM}>跟随系统</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Card>
        
        {/* 通知设置 */}
        <Card title="通知设置" style={{ marginBottom: '20px' }}>
          <Form.Item label="启用通知">
            <Switch 
              checked={settings.notificationsEnabled} 
              onChange={setNotifications} 
            />
          </Form.Item>
          
          <Form.Item label="截止日期提醒提前时间（小时）">
            <Slider 
              min={1} 
              max={72} 
              value={settings.dueDateReminderHours} 
              onChange={setDueDateReminder} 
              disabled={!settings.notificationsEnabled}
            />
            <Text type="secondary">
              将在任务截止前 {settings.dueDateReminderHours} 小时发送提醒
            </Text>
          </Form.Item>
          
          <Form.Item label="每日任务摘要">
            <Switch 
              checked={settings.dailyDigestEnabled} 
              onChange={setDailyDigest} 
              disabled={!settings.notificationsEnabled}
            />
          </Form.Item>
        </Card>
        
        {/* 任务显示设置 */}
        <Card title="任务显示设置" style={{ marginBottom: '20px' }}>
          <Form.Item label="默认任务视图">
            <Radio.Group 
              value={settings.taskListView} 
              onChange={handleTaskViewChange}
            >
              <Radio.Button value={TaskViewType.LIST}>列表</Radio.Button>
              <Radio.Button value={TaskViewType.KANBAN}>看板</Radio.Button>
              <Radio.Button value={TaskViewType.CALENDAR}>日历</Radio.Button>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item label="默认排序字段">
            <Radio.Group 
              value={settings.defaultSortField} 
              onChange={(e) => setSortField(e.target.value)}
            >
              <Radio.Button value="dueDate">截止日期</Radio.Button>
              <Radio.Button value="priority">优先级</Radio.Button>
              <Radio.Button value="createdAt">创建时间</Radio.Button>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item label="排序方向">
            <Radio.Group 
              value={settings.defaultSortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <Radio.Button value="asc">升序</Radio.Button>
              <Radio.Button value="desc">降序</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Card>
        
        {/* 森林设置 */}
        <Card title="森林场景设置" style={{ marginBottom: '20px' }}>
          <Form.Item label="渲染质量">
            <Radio.Group 
              value={settings.renderQuality} 
              onChange={handleRenderQualityChange}
            >
              <Radio.Button value={RenderQuality.LOW}>低</Radio.Button>
              <Radio.Button value={RenderQuality.MEDIUM}>中</Radio.Button>
              <Radio.Button value={RenderQuality.HIGH}>高</Radio.Button>
            </Radio.Group>
            <div>
              <Text type="secondary">
                较低的渲染质量可提高性能，但视觉效果会降低
              </Text>
            </div>
          </Form.Item>
          
          <Form.Item label="自动旋转场景">
            <Switch 
              checked={settings.autoRotate} 
              onChange={setAutoRotate} 
            />
          </Form.Item>
          
          <Form.Item label="天气效果">
            <Switch 
              checked={settings.weatherEffects} 
              onChange={setWeatherEffects} 
            />
          </Form.Item>
          
          <Form.Item label="环境音效">
            <Switch 
              checked={settings.ambientSound} 
              onChange={setAmbientSound} 
            />
          </Form.Item>
        </Card>
        
        <Divider />
        
        {/* 操作按钮 */}
        <Space>
          <Button type="primary">保存设置</Button>
          <Button onClick={handleReset}>重置为默认</Button>
        </Space>
      </Form>
    </div>
  );
};

export default SettingsPanel; 