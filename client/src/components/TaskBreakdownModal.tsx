import React, { useState } from 'react';
import { Modal, Button, Form, Input, Spin, Typography, List, Card, Tag, Divider, Tooltip, message } from 'antd';
import { FieldTimeOutlined, QuestionCircleOutlined, CheckOutlined, EditOutlined } from '@ant-design/icons';
import taskBreakdownService, { SubTask, TaskAnalysisResult, TaskBreakdownResult } from '../services/taskBreakdownService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface TaskBreakdownModalProps {
  visible: boolean;
  onClose: () => void;
  onTasksCreated?: (result: any) => void;
}

/**
 * 任务拆解模态框组件
 */
const TaskBreakdownModal: React.FC<TaskBreakdownModalProps> = ({ visible, onClose, onTasksCreated }) => {
  // 表单状态
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // 步骤状态管理
  const [step, setStep] = useState(1); // 1: 输入任务 2: 查看分析结果 3: 编辑子任务
  
  // 分析结果
  const [analysisResult, setAnalysisResult] = useState<TaskBreakdownResult | null>(null);
  const [editedSubTasks, setEditedSubTasks] = useState<SubTask[]>([]);
  
  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 调用API进行分析和拆解
      const result = await taskBreakdownService.analyzeAndDecomposeTask({
        taskId: values.taskId,
        title: values.title,
        description: values.description
      });
      
      setAnalysisResult(result as TaskBreakdownResult);
      setEditedSubTasks((result as TaskBreakdownResult).subTasks);
      setStep(2);
    } catch (error) {
      console.error('分析任务失败:', error);
      message.error('无法分析任务，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 处理子任务编辑
  const handleSubTaskEdit = (index: number, field: keyof SubTask, value: any) => {
    const newSubTasks = [...editedSubTasks];
    newSubTasks[index] = { ...newSubTasks[index], [field]: value };
    setEditedSubTasks(newSubTasks);
  };
  
  // 处理创建任务
  const handleCreateTasks = async (createTrees: boolean = true) => {
    if (!analysisResult) return;
    
    try {
      setLoading(true);
      
      // 准备拆解结果数据
      const breakdownData = {
        analysis: analysisResult.analysis,
        subTasks: editedSubTasks
      };
      
      // 调用API创建任务和树
      const result = await taskBreakdownService.createTasksFromAnalysis(breakdownData, createTrees);
      
      message.success('成功创建任务和树');
      
      // 通知父组件
      if (onTasksCreated) {
        onTasksCreated(result);
      }
      
      // 关闭模态框
      handleClose();
    } catch (error) {
      console.error('创建任务失败:', error);
      message.error('无法创建任务，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 处理关闭模态框
  const handleClose = () => {
    form.resetFields();
    setStep(1);
    setAnalysisResult(null);
    setEditedSubTasks([]);
    onClose();
  };
  
  // 渲染任务输入表单
  const renderTaskForm = () => (
    <Form form={form} layout="vertical" initialValues={{ taskId: `task-${Date.now()}` }}>
      <Form.Item
        name="title"
        label="任务标题"
        rules={[{ required: true, message: '请输入任务标题' }]}
      >
        <Input placeholder="例如：实现用户登录功能" />
      </Form.Item>
      
      <Form.Item
        name="description"
        label="任务描述"
        rules={[{ required: true, message: '请输入任务描述' }]}
      >
        <TextArea
          rows={4}
          placeholder="请详细描述任务内容，包括具体需求、功能点和预期结果"
        />
      </Form.Item>
      
      <Form.Item name="taskId" label="任务ID" hidden>
        <Input />
      </Form.Item>
    </Form>
  );
  
  // 渲染分析结果
  const renderAnalysisResult = () => {
    if (!analysisResult) return null;
    
    const { analysis, subTasks } = analysisResult;
    
    return (
      <div className="analysis-result">
        <div className="analysis-header">
          <Title level={4}>任务分析结果</Title>
          <div className="complexity-tag">
            <Tag color={
              analysis.complexity === 'SIMPLE' ? 'green' :
              analysis.complexity === 'MEDIUM' ? 'orange' : 'red'
            }>
              {analysis.complexity === 'SIMPLE' ? '简单' :
               analysis.complexity === 'MEDIUM' ? '中等' : '复杂'}
            </Tag>
          </div>
        </div>
        
        <Divider />
        
        <Title level={5}>拆解为 {subTasks.length} 个子任务</Title>
        <List
          dataSource={subTasks}
          renderItem={(subTask, index) => (
            <List.Item>
              <Card
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>{subTask.title}</Text>
                    <Tooltip title="预计工时">
                      <Tag icon={<FieldTimeOutlined />}>{subTask.estimatedHours} 小时</Tag>
                    </Tooltip>
                  </div>
                }
                style={{ width: '100%' }}
              >
                <Paragraph>{subTask.description}</Paragraph>
              </Card>
            </List.Item>
          )}
        />
      </div>
    );
  };
  
  // 渲染编辑子任务
  const renderEditSubTasks = () => {
    if (!editedSubTasks.length) return null;
    
    return (
      <div className="edit-subtasks">
        <Title level={4}>编辑子任务</Title>
        <Paragraph>
          <Text type="secondary">可以根据需要调整子任务的标题、描述和预计工时</Text>
        </Paragraph>
        
        <List
          dataSource={editedSubTasks}
          renderItem={(subTask, index) => (
            <List.Item>
              <Card
                title={
                  <Input 
                    value={subTask.title}
                    onChange={e => handleSubTaskEdit(index, 'title', e.target.value)}
                  />
                }
                style={{ width: '100%' }}
                extra={
                  <Input 
                    type="number"
                    prefix={<FieldTimeOutlined />}
                    suffix="小时"
                    value={subTask.estimatedHours}
                    onChange={e => handleSubTaskEdit(index, 'estimatedHours', parseFloat(e.target.value) || 0)}
                    style={{ width: 100 }}
                  />
                }
              >
                <TextArea
                  rows={2}
                  value={subTask.description}
                  onChange={e => handleSubTaskEdit(index, 'description', e.target.value)}
                />
              </Card>
            </List.Item>
          )}
        />
      </div>
    );
  };
  
  // 渲染按钮
  const renderFooter = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Button onClick={handleClose}>取消</Button>
            <Button type="primary" onClick={handleSubmit} loading={loading}>
              分析并拆解
            </Button>
          </>
        );
      case 2:
        return (
          <>
            <Button onClick={handleClose}>取消</Button>
            <Button onClick={() => setStep(3)}>编辑子任务</Button>
            <Button type="primary" onClick={() => handleCreateTasks(true)}>
              创建任务和树
            </Button>
          </>
        );
      case 3:
        return (
          <>
            <Button onClick={() => setStep(2)}>返回</Button>
            <Button onClick={() => handleCreateTasks(false)}>仅创建任务</Button>
            <Button type="primary" onClick={() => handleCreateTasks(true)}>
              创建任务和树
            </Button>
          </>
        );
      default:
        return null;
    }
  };
  
  return (
    <Modal
      title="AI 任务拆解"
      open={visible}
      onCancel={handleClose}
      width={800}
      footer={renderFooter()}
    >
      <Spin spinning={loading}>
        <div className="task-breakdown-modal">
          {step === 1 && renderTaskForm()}
          {step === 2 && renderAnalysisResult()}
          {step === 3 && renderEditSubTasks()}
        </div>
      </Spin>
    </Modal>
  );
};

export default TaskBreakdownModal; 