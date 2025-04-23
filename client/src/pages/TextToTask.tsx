import React, { useState } from 'react';
import { 
  Typography, Form, Input, Button, Card, message, 
  Spin, Alert, Select, Switch, Space, Divider,
  Steps, Result, Collapse, Tag, Tooltip
} from 'antd';
import { 
  FileTextOutlined, RobotOutlined, CheckCircleOutlined,
  FileAddOutlined, SendOutlined, EditOutlined,
  InfoCircleOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import textToTaskService from '../services/textToTaskService';
import '../styles/TextToTask.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;
const { Step } = Steps;

/**
 * 文本到任务页面
 * 用户可以输入长文本，由AI分析并转换为任务和任务树
 */
const TextToTask: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // 状态管理
  const [text, setText] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 步骤定义
  const steps = [
    {
      title: '输入文本',
      icon: <FileTextOutlined />,
      description: '输入需要转换的文本内容'
    },
    {
      title: 'AI处理',
      icon: <RobotOutlined />,
      description: 'AI正在分析文本内容'
    },
    {
      title: '创建成功',
      icon: <CheckCircleOutlined />,
      description: '任务创建成功'
    }
  ];
  
  // 处理文本输入变化
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };
  
  // 处理表单提交
  const handleSubmit = async () => {
    try {
      // 表单验证
      const values = await form.validateFields();
      
      // 重置错误状态
      setError(null);
      setIsLoading(true);
      setCurrentStep(1);
      
      // 准备请求数据
      const requestData = {
        text: values.text,
        createTree: values.createTree,
        treeType: values.treeType
      };
      
      // 调用服务
      const response = await textToTaskService.generateTasksFromText(requestData);
      
      // 处理响应
      if (response.data.code === 200 || response.data.code === 201) {
        setResult(response.data.data);
        setCurrentStep(2);
        message.success('文本解析并创建任务成功');
      } else {
        setError(response.data.message || '文本解析失败，请稍后重试');
        setCurrentStep(0);
      }
    } catch (error: any) {
      console.error('文本到任务转换失败:', error);
      setError(error.message || '文本解析失败，请稍后重试');
      setCurrentStep(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 跳转到任务列表页面
  const goToTaskList = () => {
    navigate('/tasks');
  };
  
  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card className="text-to-task-card">
            <Form
              form={form}
              layout="vertical"
              initialValues={{ 
                createTree: true,
                treeType: 'OAK'
              }}
            >
              <Form.Item
                name="text"
                label="输入文本内容"
                rules={[
                  { required: true, message: '请输入文本内容' },
                  { min: 50, message: '文本内容太短，至少需要50个字符' }
                ]}
              >
                <TextArea
                  rows={10}
                  placeholder="请输入需要转换为任务的文本内容，例如：产品需求文档、项目计划、会议纪要等..."
                  value={text}
                  onChange={handleTextChange}
                  className="text-input"
                />
              </Form.Item>
              
              <Divider orientation="left">任务设置</Divider>
              
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item
                  name="createTree"
                  label="创建任务树"
                  valuePropName="checked"
                  tooltip="开启后，系统会为每个任务创建对应的虚拟树木"
                >
                  <Switch defaultChecked />
                </Form.Item>
                
                <Form.Item
                  name="treeType"
                  label="树木类型"
                  tooltip="选择任务树的树木类型"
                  dependencies={['createTree']}
                >
                  <Select disabled={!form.getFieldValue('createTree')}>
                    <Option value="OAK">橡树</Option>
                    <Option value="PINE">松树</Option>
                    <Option value="MAPLE">枫树</Option>
                    <Option value="CHERRY">樱花树</Option>
                    <Option value="WILLOW">柳树</Option>
                  </Select>
                </Form.Item>
              </Space>
              
              <Form.Item className="submit-button-container">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSubmit}
                  size="large"
                  block
                >
                  开始转换
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );
        
      case 1:
        return (
          <Card className="text-to-task-card loading-card">
            <div className="loading-container">
              <Spin size="large" />
              <Paragraph className="loading-text">
                AI正在分析文本内容并生成任务结构...
              </Paragraph>
            </div>
          </Card>
        );
        
      case 2:
        if (!result) return null;
        
        return (
          <Card className="text-to-task-card result-card">
            <Result
              status="success"
              title="任务创建成功"
              subTitle={`已根据文本创建了1个主任务和${result.tasks.subTasks.length}个子任务`}
              extra={[
                <Button key="tasks" type="primary" onClick={goToTaskList}>
                  查看任务列表
                </Button>,
                <Button key="new" onClick={() => {
                  setCurrentStep(0);
                  form.resetFields();
                  setText('');
                  setResult(null);
                }}>
                  创建新任务
                </Button>
              ]}
            />
            
            <Divider orientation="left">任务详情</Divider>
            
            <Collapse defaultActiveKey={['mainTask']}>
              <Panel 
                header={
                  <Space>
                    <span>主任务: {result.tasks.mainTask.title}</span>
                    <Tag color={
                      result.analysis.complexity === 'LOW' ? 'green' :
                      result.analysis.complexity === 'MEDIUM' ? 'gold' : 'red'
                    }>
                      {result.analysis.complexity === 'LOW' ? '低' :
                       result.analysis.complexity === 'MEDIUM' ? '中' : '高'} 复杂度
                    </Tag>
                  </Space>
                } 
                key="mainTask"
              >
                <Paragraph>{result.tasks.mainTask.description}</Paragraph>
              </Panel>
              
              <Panel header={`子任务列表 (${result.tasks.subTasks.length})`} key="subTasks">
                {result.tasks.subTasks.map((subTask: any, index: number) => (
                  <Card 
                    key={index} 
                    className="subtask-card"
                    title={
                      <div className="subtask-header">
                        <Text strong>{subTask.title}</Text>
                        <Tooltip title="预计工时">
                          <Tag icon={<ClockCircleOutlined />}>
                            {subTask.estimatedHours || 0} 小时
                          </Tag>
                        </Tooltip>
                      </div>
                    }
                    style={{ marginBottom: 10 }}
                  >
                    <Paragraph>{subTask.description}</Paragraph>
                  </Card>
                ))}
              </Panel>
              
              {result.tasks.trees && (
                <Panel header="创建的任务树" key="trees">
                  <Paragraph>
                    <InfoCircleOutlined style={{ marginRight: 8 }} />
                    已为所有任务创建了对应的任务树，完成任务可以使树木生长
                  </Paragraph>
                  
                  <div className="tree-info">
                    <Title level={5}>主树</Title>
                    <Paragraph>类型: {result.tasks.trees.mainTree.type}</Paragraph>
                    <Paragraph>名称: {result.tasks.trees.mainTree.name}</Paragraph>
                    
                    <Title level={5}>子树</Title>
                    <Paragraph>数量: {result.tasks.trees.subTrees.length}棵</Paragraph>
                  </div>
                </Panel>
              )}
            </Collapse>
          </Card>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="text-to-task-container">
      <div className="text-to-task-header">
        <Title level={2}>
          <FileAddOutlined /> 文本转任务工具
        </Title>
        <Paragraph>
          将长文本自动转换为结构化任务和任务树，快速构建任务列表
        </Paragraph>
      </div>
      
      <div className="text-to-task-steps">
        <Steps
          current={currentStep}
          items={steps.map(step => ({
            title: step.title,
            description: step.description,
            icon: step.icon
          }))}
        />
      </div>
      
      {error && (
        <Alert
          message="处理出错"
          description={error}
          type="error"
          closable
          style={{ marginBottom: 16 }}
        />
      )}
      
      <div className="text-to-task-content">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default TextToTask; 