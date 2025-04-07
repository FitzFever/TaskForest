import { useState, useEffect } from 'react';
import { Button, Card, Col, Row, Typography, List, Tag, Divider, message } from 'antd';
import { TaskService, TreeService, CategoryService } from '../lib/db';

const { Title, Text } = Typography;

/**
 * 测试页面组件
 * 用于调试和测试应用程序的各种功能
 */
const TestPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [trees, setTrees] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    tasks: false,
    trees: false,
    categories: false
  });

  // 加载数据
  const fetchData = async () => {
    // 获取任务
    try {
      setLoading(prev => ({ ...prev, tasks: true }));
      const taskData = await TaskService.getAllTasks();
      setTasks(taskData);
    } catch (error) {
      console.error('获取任务失败:', error);
      message.error('获取任务失败');
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }

    // 获取树木
    try {
      setLoading(prev => ({ ...prev, trees: true }));
      const treeData = await TreeService.getAllTrees();
      setTrees(treeData);
    } catch (error) {
      console.error('获取树木失败:', error);
      message.error('获取树木失败');
    } finally {
      setLoading(prev => ({ ...prev, trees: false }));
    }

    // 获取分类
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      const categoryData = await CategoryService.getAllCategories();
      setCategories(categoryData);
    } catch (error) {
      console.error('获取分类失败:', error);
      message.error('获取分类失败');
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 测试创建任务
  const testCreateTask = async () => {
    try {
      // 随机类型
      const treeTypes = ['oak', 'pine', 'cherry', 'palm', 'apple', 'maple', 'willow'];
      const randomType = treeTypes[Math.floor(Math.random() * treeTypes.length)];
      
      // 随机分类
      let categoryId = null;
      if (categories.length > 0) {
        categoryId = categories[Math.floor(Math.random() * categories.length)].id;
      }
      
      // 创建测试任务
      await TaskService.createTask({
        title: `测试任务 ${new Date().toLocaleTimeString()}`,
        description: '这是一个通过测试页面创建的任务',
        priority: ['低', '中', '高'][Math.floor(Math.random() * 3)],
        treeType: randomType,
        categoryId
      });
      
      message.success('测试任务创建成功');
      fetchData();
    } catch (error) {
      console.error('创建测试任务失败:', error);
      message.error('创建测试任务失败');
    }
  };

  // 测试完成任务
  const testCompleteTask = async () => {
    try {
      const incompleteTasks = tasks.filter(task => task.status !== '已完成');
      
      if (incompleteTasks.length === 0) {
        message.info('没有未完成的任务可供测试');
        return;
      }
      
      // 随机选择一个未完成的任务
      const randomTask = incompleteTasks[Math.floor(Math.random() * incompleteTasks.length)];
      
      await TaskService.completeTask(randomTask.id);
      message.success(`任务 "${randomTask.title}" 已完成`);
      fetchData();
    } catch (error) {
      console.error('完成任务失败:', error);
      message.error('完成任务失败');
    }
  };

  // 测试创建分类
  const testCreateCategory = async () => {
    try {
      const colors = ['#f5222d', '#fa8c16', '#faad14', '#52c41a', '#13c2c2', '#1890ff', '#722ed1', '#eb2f96'];
      
      await CategoryService.createCategory({
        name: `测试分类 ${new Date().toLocaleTimeString()}`,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
      
      message.success('测试分类创建成功');
      fetchData();
    } catch (error) {
      console.error('创建测试分类失败:', error);
      message.error('创建测试分类失败');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>TaskForest 测试页面</Title>
      <Text type="secondary">用于测试和调试应用程序功能</Text>
      
      <Divider />
      
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="测试操作" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col>
                <Button type="primary" onClick={testCreateTask}>创建测试任务</Button>
              </Col>
              <Col>
                <Button type="primary" onClick={testCompleteTask}>完成随机任务</Button>
              </Col>
              <Col>
                <Button type="primary" onClick={testCreateCategory}>创建测试分类</Button>
              </Col>
              <Col>
                <Button onClick={fetchData}>刷新数据</Button>
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card 
            title={`任务列表 (${tasks.length})`} 
            bordered={false} 
            loading={loading.tasks}
          >
            <List
              dataSource={tasks}
              renderItem={(task) => (
                <List.Item>
                  <List.Item.Meta
                    title={task.title}
                    description={
                      <>
                        <Tag color={
                          task.status === '已完成' ? 'green' :
                          task.status === '进行中' ? 'blue' : 'default'
                        }>
                          {task.status}
                        </Tag>
                        {task.category && (
                          <Tag color={task.category.color}>
                            {task.category.name}
                          </Tag>
                        )}
                        <Tag color={
                          task.priority === '高' ? 'red' :
                          task.priority === '中' ? 'orange' : 'green'
                        }>
                          {task.priority}
                        </Tag>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        <Col span={8}>
          <Card 
            title={`树木列表 (${trees.length})`} 
            bordered={false} 
            loading={loading.trees}
          >
            <List
              dataSource={trees}
              renderItem={(tree) => (
                <List.Item>
                  <List.Item.Meta
                    title={`${tree.type} 树 (ID: ${tree.id})`}
                    description={
                      <>
                        <Tag color="blue">生长阶段: {tree.growthStage}/5</Tag>
                        <div>位置: {tree.position}</div>
                        {tree.task && (
                          <div>关联任务: {tree.task.title}</div>
                        )}
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        <Col span={8}>
          <Card 
            title={`分类列表 (${categories.length})`} 
            bordered={false} 
            loading={loading.categories}
          >
            <List
              dataSource={categories}
              renderItem={(category) => (
                <List.Item>
                  <List.Item.Meta
                    title={category.name}
                    description={
                      <>
                        <Tag color={category.color}>颜色示例</Tag>
                        <div>任务数量: {category.tasks?.length || 0}</div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TestPage; 