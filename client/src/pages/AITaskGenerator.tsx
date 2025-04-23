import React, { useState } from 'react';
import { 
  Typography, Card, Input, Button, Form, Divider, 
  Row, Col, Spin, Alert, Steps, message, Tag, Space, Tooltip
} from 'antd';
import { 
  RobotOutlined, FileTextOutlined, ApartmentOutlined, 
  SendOutlined, EditOutlined, SaveOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import taskBreakdownService from '../services/taskBreakdownService';
import { useNavigate } from 'react-router-dom';
import '../styles/AITaskGenerator.css';
import { createTasksFromDecomposition } from '../services/batchTaskService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/**
 * AI任务生成页面
 * 用户可以通过文本描述使用DeepSeek API生成结构化任务
 */
const AITaskGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // 状态管理
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedTasks, setGeneratedTasks] = useState<any>(null);
  const [userInput, setUserInput] = useState('');
  
  // 任务生成步骤
  const steps = [
    {
      title: '描述需求',
      icon: <FileTextOutlined />,
      description: '描述您的项目或任务需求'
    },
    {
      title: 'AI分析',
      icon: <RobotOutlined />,
      description: 'AI正在分析您的需求'
    },
    {
      title: '查看任务',
      icon: <ApartmentOutlined />,
      description: '查看并编辑生成的任务'
    }
  ];
  
  // 处理用户输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };
  
  // 处理表单提交
  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setError(null);
      setIsLoading(true);
      setCurrentStep(1);
      
      // 生成临时任务ID
      const tempTaskId = `task-${Date.now()}`;
      
      // 提取表单数据
      const formData = form.getFieldsValue();
      
      try {
        // 调用AI任务分析和分解
        console.log('开始调用任务分析和分解:', {
          taskId: tempTaskId,
          title: formData.title || '新项目任务',
          description: formData.description
        });
        
        const result = await taskBreakdownService.analyzeAndDecomposeTask({
          taskId: tempTaskId,
          title: formData.title || '新项目任务',
          description: formData.description
        });
        
        console.log('任务分析和分解结果:', result);
        setGeneratedTasks(result);
        setCurrentStep(2);
      } catch (error) {
        console.error('任务生成失败:', error);
        // 更详细的错误处理
        let errorMessage = '无法生成任务，请检查您的输入或稍后重试';
        if (error instanceof Error) {
          errorMessage = `生成失败: ${error.message}`;
        } else if (typeof error === 'object' && error !== null) {
          errorMessage = `生成失败: ${JSON.stringify(error)}`;
        }
        setError(errorMessage);
        setCurrentStep(0);
      }
    } catch (validationError) {
      console.log('表单验证失败:', validationError);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 创建任务和任务树
  const handleCreateTasks = async (createTrees = true) => {
    if (!generatedTasks) return;
    
    setIsLoading(true);
    try {
      // 使用新的批量任务服务
      const mainTask = {
        title: generatedTasks.analysis.title,
        description: generatedTasks.analysis.description,
        complexity: generatedTasks.analysis.complexity,
        priority: 'MEDIUM',
      };
      
      const result = await createTasksFromDecomposition(
        mainTask,
        generatedTasks.subTasks,
        createTrees
      );
      
      message.success('任务创建成功！');
      // 导航到任务列表
      navigate('/tasks');
    } catch (error) {
      console.error('创建任务失败:', error);
      message.error('创建任务失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 处理用户输入的预设模板
  const handleTemplateClick = (template: string) => {
    form.setFieldsValue({ 
      description: template,
      title: '新项目开发计划'
    });
    setUserInput(template);
  };
  
  // AI任务生成预设模板
  const templates = [
    {
      title: '项目开发',
      content: '我需要开发一个电子商务网站，包含用户注册登录、商品展示、购物车、订单管理和支付系统功能。请帮我将这个项目拆解为合适的任务。'
    },
    {
      title: '前端开发',
      content: '我需要设计并实现一个响应式单页应用，包含数据展示面板、用户资料管理、图表统计和主题定制功能。'
    },
    {
      title: '移动应用',
      content: '我计划开发一个健康跟踪应用，需要包含每日锻炼记录、饮食管理、数据统计和社交分享功能。'
    }
  ];
  
  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form form={form} layout="vertical" requiredMark="optional">
            <Form.Item
              name="title"
              label="项目或任务标题"
              rules={[{ required: true, message: '请输入项目或任务标题' }]}
            >
              <Input placeholder="例如：电子商务网站开发" />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="需求描述"
              rules={[
                { required: true, message: '请输入详细需求描述' },
                { min: 20, message: '描述至少需要20个字符' }
              ]}
            >
              <TextArea
                rows={8}
                placeholder="请详细描述您的项目或任务需求，包括功能点、技术要求、期望等..."
                value={userInput}
                onChange={handleInputChange}
              />
            </Form.Item>
            
            <Form.Item>
              <div className="ai-generator-help">
                <Text type="secondary">
                  提示：描述越详细，AI生成的任务分解越准确。您可以包含功能要求、技术栈、关键特性等信息。
                </Text>
              </div>
            </Form.Item>
            
            <Divider orientation="left">使用预设模板</Divider>
            
            <div className="template-cards">
              <Row gutter={[16, 16]}>
                {templates.map((template, index) => (
                  <Col xs={24} sm={24} md={8} key={index}>
                    <Card
                      hoverable
                      className="template-card"
                      onClick={() => handleTemplateClick(template.content)}
                    >
                      <Title level={5}>{template.title}</Title>
                      <Paragraph ellipsis={{ rows: 3 }}>
                        {template.content}
                      </Paragraph>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
            
            <Form.Item>
              <Button 
                type="primary" 
                icon={<SendOutlined />} 
                onClick={handleSubmit}
                size="large"
                block
              >
                生成任务
              </Button>
            </Form.Item>
          </Form>
        );
        
      case 1:
        return (
          <div className="loading-container">
            <Spin size="large" />
            <Paragraph className="loading-text">
              AI正在分析您的需求并生成结构化任务...
            </Paragraph>
          </div>
        );
        
      case 2:
        if (!generatedTasks) return null;
        
        return (
          <div className="generated-tasks-container">
            <Alert
              message="AI任务生成完成"
              description="AI已根据您的描述生成以下任务结构，您可以查看并按需编辑，然后创建实际任务。"
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />
            
            <Card className="main-task-card">
              <div className="task-header">
                <Title level={4}>{generatedTasks.analysis.title}</Title>
                <Tag color={
                  generatedTasks.analysis.complexity === 'SIMPLE' ? 'green' :
                  generatedTasks.analysis.complexity === 'MEDIUM' ? 'gold' : 'red'
                }>
                  {generatedTasks.analysis.complexity === 'SIMPLE' ? '简单' :
                   generatedTasks.analysis.complexity === 'MEDIUM' ? '中等' : '复杂'} 复杂度
                </Tag>
              </div>
              
              <Divider />
              
              <Title level={5}>子任务 ({generatedTasks.subTasks.length})</Title>
              
              {generatedTasks.subTasks.map((subtask: any, index: number) => (
                <Card 
                  key={index} 
                  className="subtask-card"
                  title={
                    <div className="subtask-header">
                      <Text strong>{subtask.title}</Text>
                      <Space>
                        {subtask.type && (
                          <Tag color="blue">{subtask.type}</Tag>
                        )}
                        <Tooltip title="预计工时">
                          <Tag icon={<ClockCircleOutlined />}>{subtask.estimatedHours} 小时</Tag>
                        </Tooltip>
                      </Space>
                    </div>
                  }
                >
                  <Paragraph>{subtask.description}</Paragraph>
                  
                  {/* 显示子任务标签 */}
                  {Array.isArray(subtask.tags) && subtask.tags.length > 0 && (
                    <div className="subtask-tags">
                      <Space size={[0, 8]} wrap>
                        {subtask.tags.map((tag: string, tagIndex: number) => (
                          <Tag key={tagIndex}>{tag}</Tag>
                        ))}
                      </Space>
                    </div>
                  )}
                </Card>
              ))}
              
              <div className="task-actions">
                <Space>
                  <Button icon={<EditOutlined />} onClick={() => setCurrentStep(0)}>
                    返回编辑
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />}
                    onClick={() => handleCreateTasks(true)}
                    loading={isLoading}
                  >
                    创建任务和任务树
                  </Button>
                </Space>
              </div>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="ai-task-generator-container">
      <div className="ai-task-generator-header">
        <Title level={2}>
          <RobotOutlined /> AI任务生成器
        </Title>
        <Paragraph>
          使用AI智能助手快速分析您的需求并生成结构化任务
        </Paragraph>
      </div>
      
      <div className="ai-task-generator-steps">
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
          message="生成出错"
          description={error}
          type="error"
          closable
          style={{ marginBottom: 24 }}
        />
      )}
      
      <div className="ai-task-generator-content">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default AITaskGenerator; 