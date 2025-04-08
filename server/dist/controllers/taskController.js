import taskService from '../services/taskService.js';
/**
 * 获取任务列表
 * @route GET /api/tasks
 */
export const getTasks = async (req, res) => {
    try {
        // 提取查询参数
        const { status, type, dueDate, tags, page = '1', limit = '20', sort = 'dueDate', order = 'asc' } = req.query;
        // 将标签字符串转为数组
        const tagArray = tags ? String(tags).split(',') : undefined;
        // 获取任务列表
        const result = await taskService.getTasks({
            status: status ? String(status) : undefined,
            type: type ? String(type) : undefined,
            dueDate: dueDate ? String(dueDate) : undefined,
            tags: tagArray,
            page: parseInt(String(page), 10),
            limit: parseInt(String(limit), 10),
            sort: String(sort),
            order: String(order)
        });
        // 返回成功响应
        return res.status(200).json({
            code: 200,
            data: result,
            message: 'Success',
            timestamp: Date.now()
        });
    }
    catch (error) {
        console.error('获取任务列表失败:', error);
        // 返回错误响应
        return res.status(500).json({
            code: 500,
            data: null,
            error: {
                message: '获取任务列表失败',
                type: 'INTERNAL_ERROR'
            },
            message: 'Internal Server Error',
            timestamp: Date.now()
        });
    }
};
/**
 * 获取单个任务
 * @route GET /api/tasks/:id
 */
export const getTask = async (req, res) => {
    try {
        const { id } = req.params;
        // 获取任务详情
        const task = await taskService.getTaskById(id);
        // 如果任务不存在，返回404
        if (!task) {
            return res.status(404).json({
                code: 404,
                data: null,
                error: {
                    message: '任务不存在',
                    type: 'NOT_FOUND'
                },
                message: 'Not Found',
                timestamp: Date.now()
            });
        }
        // 返回成功响应
        return res.status(200).json({
            code: 200,
            data: task,
            message: 'Success',
            timestamp: Date.now()
        });
    }
    catch (error) {
        console.error('获取任务失败:', error);
        // 返回错误响应
        return res.status(500).json({
            code: 500,
            data: null,
            error: {
                message: '获取任务失败',
                type: 'INTERNAL_ERROR'
            },
            message: 'Internal Server Error',
            timestamp: Date.now()
        });
    }
};
/**
 * 创建任务
 * @route POST /api/tasks
 */
export const createTask = async (req, res) => {
    try {
        // 获取请求体数据
        const taskData = req.body;
        // 验证必要字段
        if (!taskData.title) {
            return res.status(400).json({
                code: 400,
                data: null,
                error: {
                    message: '任务标题不能为空',
                    type: 'VALIDATION_ERROR',
                    details: {
                        field: 'title',
                        reason: 'required'
                    }
                },
                message: 'Bad Request',
                timestamp: Date.now()
            });
        }
        // 创建任务
        const task = await taskService.createTask(taskData);
        // 返回成功响应
        return res.status(201).json({
            code: 201,
            data: task,
            message: 'Task created successfully',
            timestamp: Date.now()
        });
    }
    catch (error) {
        console.error('创建任务失败:', error);
        // 返回错误响应
        return res.status(500).json({
            code: 500,
            data: null,
            error: {
                message: '创建任务失败',
                type: 'INTERNAL_ERROR'
            },
            message: 'Internal Server Error',
            timestamp: Date.now()
        });
    }
};
/**
 * 更新任务
 * @route PUT /api/tasks/:id
 */
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const taskData = req.body;
        // 检查任务是否存在
        const existingTask = await taskService.getTaskById(id);
        if (!existingTask) {
            return res.status(404).json({
                code: 404,
                data: null,
                error: {
                    message: '任务不存在',
                    type: 'NOT_FOUND'
                },
                message: 'Not Found',
                timestamp: Date.now()
            });
        }
        // 更新任务
        const updatedTask = await taskService.updateTask(id, taskData);
        // 返回成功响应
        return res.status(200).json({
            code: 200,
            data: updatedTask,
            message: 'Task updated successfully',
            timestamp: Date.now()
        });
    }
    catch (error) {
        console.error('更新任务失败:', error);
        // 返回错误响应
        return res.status(500).json({
            code: 500,
            data: null,
            error: {
                message: '更新任务失败',
                type: 'INTERNAL_ERROR'
            },
            message: 'Internal Server Error',
            timestamp: Date.now()
        });
    }
};
/**
 * 删除任务
 * @route DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        // 检查任务是否存在
        const existingTask = await taskService.getTaskById(id);
        if (!existingTask) {
            return res.status(404).json({
                code: 404,
                data: null,
                error: {
                    message: '任务不存在',
                    type: 'NOT_FOUND'
                },
                message: 'Not Found',
                timestamp: Date.now()
            });
        }
        // 删除任务
        await taskService.deleteTask(id);
        // 返回成功响应
        return res.status(200).json({
            code: 200,
            data: null,
            message: 'Task deleted successfully',
            timestamp: Date.now()
        });
    }
    catch (error) {
        console.error('删除任务失败:', error);
        // 返回错误响应
        return res.status(500).json({
            code: 500,
            data: null,
            error: {
                message: '删除任务失败',
                type: 'INTERNAL_ERROR'
            },
            message: 'Internal Server Error',
            timestamp: Date.now()
        });
    }
};
/**
 * 更新任务状态
 * @route PUT /api/tasks/:id/status
 */
export const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        // 验证状态
        const validStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                code: 400,
                data: null,
                error: {
                    message: '无效的任务状态',
                    type: 'VALIDATION_ERROR',
                    details: {
                        field: 'status',
                        reason: 'invalid',
                        allowedValues: validStatuses
                    }
                },
                message: 'Bad Request',
                timestamp: Date.now()
            });
        }
        // 检查任务是否存在
        const existingTask = await taskService.getTaskById(id);
        if (!existingTask) {
            return res.status(404).json({
                code: 404,
                data: null,
                error: {
                    message: '任务不存在',
                    type: 'NOT_FOUND'
                },
                message: 'Not Found',
                timestamp: Date.now()
            });
        }
        // 更新任务状态
        const result = await taskService.updateTaskStatus(id, status);
        // 返回成功响应
        return res.status(200).json({
            code: 200,
            data: result,
            message: 'Task status updated successfully',
            timestamp: Date.now()
        });
    }
    catch (error) {
        console.error('更新任务状态失败:', error);
        // 返回错误响应
        return res.status(500).json({
            code: 500,
            data: null,
            error: {
                message: '更新任务状态失败',
                type: 'INTERNAL_ERROR'
            },
            message: 'Internal Server Error',
            timestamp: Date.now()
        });
    }
};
/**
 * 完成任务
 * @route POST /api/tasks/:id/complete
 */
export const completeTask = async (req, res) => {
    try {
        const { id } = req.params;
        // 检查任务是否存在
        const existingTask = await taskService.getTaskById(id);
        if (!existingTask) {
            return res.status(404).json({
                code: 404,
                data: null,
                error: {
                    message: '任务不存在',
                    type: 'NOT_FOUND'
                },
                message: 'Not Found',
                timestamp: Date.now()
            });
        }
        // 如果任务已完成，返回错误
        if (existingTask.status === 'COMPLETED') {
            return res.status(400).json({
                code: 400,
                data: null,
                error: {
                    message: '任务已完成',
                    type: 'VALIDATION_ERROR'
                },
                message: 'Bad Request',
                timestamp: Date.now()
            });
        }
        // 完成任务
        const result = await taskService.completeTask(id);
        // 返回成功响应
        return res.status(200).json({
            code: 200,
            data: result,
            message: 'Task completed successfully',
            timestamp: Date.now()
        });
    }
    catch (error) {
        console.error('完成任务失败:', error);
        // 返回错误响应
        return res.status(500).json({
            code: 500,
            data: null,
            error: {
                message: '完成任务失败',
                type: 'INTERNAL_ERROR'
            },
            message: 'Internal Server Error',
            timestamp: Date.now()
        });
    }
};
export default {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    completeTask
};
//# sourceMappingURL=taskController.js.map