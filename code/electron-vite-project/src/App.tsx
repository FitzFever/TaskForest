import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'
import { Layout, Menu, Button, List, Typography } from 'antd'
import { 
  ScheduleOutlined, 
  AppstoreOutlined, 
  BarChartOutlined, 
  SettingOutlined,
  PlusOutlined
} from '@ant-design/icons'
import * as THREE from 'three'
import './App.css'

const { Header, Sider, Content } = Layout
const { Title } = Typography

// 简单的地面组件
function Ground() {
  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -0.5, 0]} 
      receiveShadow
    >
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#8cba80" />
    </mesh>
  )
}

// 简单的树模型
function Tree(props: { position?: [number, number, number] }) {
  const { position = [0, 0, 0] } = props
  
  return (
    <group position={position}>
      {/* 树干 */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.5, 1.5]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      {/* 树冠 */}
      <mesh position={[0, 2, 0]} castShadow>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </group>
  )
}

// 3D场景组件
function Forest() {
  return (
    <Canvas shadows camera={{ position: [5, 5, 5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048}
      />
      <OrbitControls />
      <Sky sunPosition={[100, 10, 100]} />
      <Ground />
      <Tree position={[-2, 0, -2]} />
      <Tree position={[0, 0, 0]} />
      <Tree position={[2, 0, 2]} />
    </Canvas>
  )
}

// 示例任务数据
const mockTasks = [
  { id: 1, title: '完成TaskForest基础搭建', status: '进行中', priority: '高' },
  { id: 2, title: '实现3D树木模型加载', status: '待办', priority: '中' },
  { id: 3, title: '设计任务管理界面', status: '待办', priority: '中' },
  { id: 4, title: '配置数据库存储', status: '已完成', priority: '高' },
  { id: 5, title: '添加任务创建功能', status: '待办', priority: '低' },
]

function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState('tasks')

  const renderContent = () => {
    switch (selectedMenuItem) {
      case 'tasks':
        return (
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Title level={3}>任务列表</Title>
              <Button type="primary" icon={<PlusOutlined />}>
                新建任务
              </Button>
            </div>
            <List
              bordered
              dataSource={mockTasks}
              renderItem={(task) => (
                <List.Item 
                  actions={[
                    <Button key="edit" type="link">编辑</Button>,
                    <Button key="delete" type="link" danger>删除</Button>
                  ]}
                >
                  <List.Item.Meta
                    title={task.title}
                    description={`优先级: ${task.priority} | 状态: ${task.status}`}
                  />
                </List.Item>
              )}
            />
          </div>
        )
      case 'forest':
        return (
          <div style={{ height: '100%' }}>
            <Forest />
          </div>
        )
      default:
        return <div>其他功能正在开发中...</div>
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="light"
      >
        <div style={{ height: 32, margin: 16, textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>TaskForest</Title>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['tasks']}
          onClick={({ key }) => setSelectedMenuItem(key)}
          items={[
            {
              key: 'tasks',
              icon: <ScheduleOutlined />,
              label: '任务管理',
            },
            {
              key: 'forest',
              icon: <AppstoreOutlined />,
              label: '我的森林',
            },
            {
              key: 'stats',
              icon: <BarChartOutlined />,
              label: '数据统计',
            },
            {
              key: 'settings',
              icon: <SettingOutlined />,
              label: '设置',
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ padding: '0 24px' }}>
            <Title level={4} style={{ margin: 0, lineHeight: '64px' }}>
              {selectedMenuItem === 'tasks' && '任务管理'}
              {selectedMenuItem === 'forest' && '我的森林'}
              {selectedMenuItem === 'stats' && '数据统计'}
              {selectedMenuItem === 'settings' && '设置'}
            </Title>
          </div>
        </Header>
        <Content style={{ margin: '0', overflow: 'initial', height: 'calc(100vh - 64px)' }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
