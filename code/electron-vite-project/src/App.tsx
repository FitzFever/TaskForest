import React, { useState, useEffect } from 'react'
import { Layout, Menu, Button, Alert, message, Typography, Card, Row, Col } from 'antd'
import { 
  ScheduleOutlined, 
  AppstoreOutlined, 
  BarChartOutlined, 
  SettingOutlined,
  ExperimentOutlined
} from '@ant-design/icons'
import './App.css'
import TaskList from './components/TaskList'
import ForestScene from './components/ForestScene'

const { Header, Sider, Content } = Layout
const { Title } = Typography

// 页面内容
enum ContentView {
  TASKS = 'tasks',
  FOREST = 'forest',
  STATS = 'stats',
  SETTINGS = 'settings',
  TEST = 'test'
}

// 测试组件视图
const TestView = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Title level={3}>测试页面</Title>
      <Alert
        message="测试模式"
        description="这是一个简单的测试页面，用于验证应用程序能够正常渲染。如果您能看到此页面，则表示应用程序正在正常工作。"
        type="info"
        showIcon
        style={{ marginBottom: '20px' }}
      />
      
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card title="UI组件测试" style={{ height: '200px' }}>
            <p>这是一个简单的卡片组件</p>
            <Button type="primary">测试按钮</Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="颜色测试" style={{ height: '200px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ height: '30px', background: 'red' }}></div>
              <div style={{ height: '30px', background: 'green' }}></div>
              <div style={{ height: '30px', background: 'blue' }}></div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="状态测试" style={{ height: '200px' }}>
            <TestCounter />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// 简单的计数器组件测试
const TestCounter = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>计数器: {count}</p>
      <Button onClick={() => setCount(count + 1)}>增加</Button>
      <Button onClick={() => setCount(count - 1)} style={{ marginLeft: '8px' }}>减少</Button>
    </div>
  );
};

function App() {
  const [selectedView, setSelectedView] = useState<ContentView>(ContentView.TEST)
  const [has3DError, setHas3DError] = useState(false);

  // 应用启动时显示提示
  useEffect(() => {
    message.info('应用已启动。如果3D页面显示为黑屏，请尝试切换到测试页面。');
  }, []);

  const renderContent = () => {
    try {
      switch (selectedView) {
        case ContentView.TASKS:
          return <TaskList />
        case ContentView.FOREST:
          return <ForestScene />
        case ContentView.STATS:
          return <div>统计数据页面（开发中）</div>
        case ContentView.SETTINGS:
          return <div>设置页面（开发中）</div>
        case ContentView.TEST:
          return <TestView />
        default:
          return <TestView />
      }
    } catch (error) {
      console.error('渲染页面错误:', error);
      setHas3DError(true);
      return <TestView />
    }
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider width={200} theme="light">
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>TaskForest</Title>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[selectedView]}
          style={{ height: '100%', borderRight: 0 }}
          onSelect={({ key }) => setSelectedView(key as ContentView)}
        >
          <Menu.Item key={ContentView.TEST}>
            测试页面
          </Menu.Item>
          <Menu.Item key={ContentView.TASKS}>
            任务列表
          </Menu.Item>
          <Menu.Item key={ContentView.FOREST}>
            我的森林
          </Menu.Item>
          <Menu.Item key={ContentView.STATS}>
            统计数据
          </Menu.Item>
          <Menu.Item key={ContentView.SETTINGS}>
            设置
          </Menu.Item>
        </Menu>
      </Sider>
      
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>
            {selectedView === ContentView.TASKS && '任务列表'}
            {selectedView === ContentView.FOREST && '我的森林'}
            {selectedView === ContentView.STATS && '统计数据'}
            {selectedView === ContentView.SETTINGS && '设置'}
            {selectedView === ContentView.TEST && '测试页面'}
          </Title>
        </Header>
        
        {has3DError && (
          <Alert
            message="渲染警告"
            description="3D页面可能无法正常显示。请尝试使用测试页面或任务列表页面。"
            type="warning"
            showIcon
            style={{ margin: '0 16px' }}
            closable
          />
        )}
        
        <Content style={{ padding: '0', height: '100%', overflow: 'auto' }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
