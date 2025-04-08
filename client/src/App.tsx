import React, { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu, Button, Spin } from 'antd';
import { HomeOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons';

// 页面组件
const Home = React.lazy(() => import('./pages/Home'));
const Forest = React.lazy(() => import('./pages/Forest'));
const Settings = React.lazy(() => import('./pages/Settings'));

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟加载
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="logo" style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', marginRight: '20px' }}>
          TaskForest
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['home']}
          style={{ flex: 1 }}
          items={[
            { key: 'home', icon: <HomeOutlined />, label: <Link to="/">任务</Link> },
            { key: 'forest', icon: <AppstoreOutlined />, label: <Link to="/forest">森林</Link> },
            { key: 'settings', icon: <SettingOutlined />, label: <Link to="/settings">设置</Link> },
          ]}
        />
      </Header>
      
      <Content style={{ padding: '20px', background: '#f0f2f5' }}>
        <React.Suspense fallback={<Spin size="large" style={{ margin: '20px auto', display: 'block' }} />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/forest" element={<Forest />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </React.Suspense>
      </Content>
      
      <Footer style={{ textAlign: 'center' }}>
        TaskForest ©{new Date().getFullYear()} - 让任务管理更有趣
      </Footer>
    </Layout>
  );
};

export default App; 