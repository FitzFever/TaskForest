import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'

// 确保环境变量有默认值
const currentDir = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(currentDir, '../dist')
const PUBLIC = app.isPackaged ? DIST : path.join(currentDir, '../public')

let mainWindow: BrowserWindow | null = null
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

// 初始化Prisma客户端
const prisma = new PrismaClient()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(currentDir, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Test active push message to Renderer-process.
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    // 在开发环境中打开开发者工具
    mainWindow.webContents.openDevTools()
  } else {
    // win.loadFile('dist/index.html')
    mainWindow.loadFile(path.join(DIST, 'index.html'))
  }

  // 窗口关闭时清空引用
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    mainWindow = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()

  // 设置Models目录
  const modelsDir = path.join(process.env.VITE_DEV_SERVER_URL 
    ? path.resolve(__dirname, '../../models') 
    : path.join(app.getAppPath(), 'models')
  )
  
  console.log('Models目录:', modelsDir)

  // 处理任务相关的IPC通信
  setupIpcHandlers()

  // 在macOS上，当用户关闭所有窗口后点击dock图标时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 设置IPC处理函数
function setupIpcHandlers() {
  // 获取所有任务
  ipcMain.handle('get-tasks', async () => {
    try {
      return await prisma.task.findMany({
        include: {
          category: true,
          tree: true,
        }
      })
    } catch (error) {
      console.error('获取任务失败:', error)
      throw new Error('获取任务失败')
    }
  })

  // 创建新任务
  ipcMain.handle('create-task', async (_, taskData) => {
    try {
      const createdTask = await prisma.task.create({
        data: taskData,
        include: {
          category: true,
        }
      })

      // 如果包含树木类型，创建对应的树木
      if (taskData.treeType) {
        const tree = await prisma.tree.create({
          data: {
            type: taskData.treeType,
            position: `${Math.random() * 10 - 5},0,${Math.random() * 10 - 5}`,
            task: {
              connect: {
                id: createdTask.id
              }
            }
          }
        })

        // 更新任务关联的树木
        await prisma.task.update({
          where: { id: createdTask.id },
          data: { treeId: tree.id }
        })
      }

      return createdTask
    } catch (error) {
      console.error('创建任务失败:', error)
      throw new Error('创建任务失败')
    }
  })

  // 更新任务
  ipcMain.handle('update-task', async (_, { id, data }) => {
    try {
      return await prisma.task.update({
        where: { id },
        data,
        include: {
          category: true,
          tree: true,
        }
      })
    } catch (error) {
      console.error('更新任务失败:', error)
      throw new Error('更新任务失败')
    }
  })

  // 删除任务
  ipcMain.handle('delete-task', async (_, id) => {
    try {
      // 先删除关联的树木
      await prisma.tree.deleteMany({
        where: { taskId: id }
      })

      // 然后删除任务
      return await prisma.task.delete({
        where: { id }
      })
    } catch (error) {
      console.error('删除任务失败:', error)
      throw new Error('删除任务失败')
    }
  })

  // 完成任务
  ipcMain.handle('complete-task', async (_, id) => {
    try {
      // 标记任务为已完成
      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          status: '已完成',
          completedAt: new Date()
        },
        include: {
          tree: true
        }
      })

      // 如果有关联的树木，更新树木生长阶段为最终阶段(5)
      if (updatedTask.tree) {
        await prisma.tree.update({
          where: { id: updatedTask.tree.id },
          data: { growthStage: 5 }
        })
      }

      return updatedTask
    } catch (error) {
      console.error('完成任务失败:', error)
      throw new Error('完成任务失败')
    }
  })

  // 获取所有树木
  ipcMain.handle('get-trees', async () => {
    try {
      return await prisma.tree.findMany({
        include: {
          task: true
        }
      })
    } catch (error) {
      console.error('获取树木失败:', error)
      throw new Error('获取树木失败')
    }
  })

  // 创建树木
  ipcMain.handle('create-tree', async (_, data) => {
    try {
      // 处理taskId字段，转换为合适的Prisma格式
      let prismaData = { ...data };
      
      if (data.taskId) {
        // 从输入中移除taskId字段
        const { taskId, ...restData } = data;
        
        // 使用正确的task connect语法
        prismaData = {
          ...restData,
          task: {
            connect: { id: taskId }
          }
        };
      }
      
      return await prisma.tree.create({
        data: prismaData,
        include: {
          task: true
        }
      });
    } catch (error) {
      console.error('创建树木失败:', error);
      throw new Error('创建树木失败');
    }
  });

  // 更新树木生长阶段
  ipcMain.handle('grow-tree', async (_, id) => {
    try {
      const tree = await prisma.tree.findUnique({
        where: { id }
      })

      if (!tree) {
        throw new Error('树木不存在')
      }

      // 最大生长阶段为5
      const newGrowthStage = Math.min(tree.growthStage + 1, 5)

      return await prisma.tree.update({
        where: { id },
        data: {
          growthStage: newGrowthStage
        }
      })
    } catch (error) {
      console.error('更新树木生长阶段失败:', error)
      throw new Error('更新树木生长阶段失败')
    }
  })

  // 处理分类相关的IPC通信
  
  // 获取所有分类
  ipcMain.handle('get-categories', async () => {
    try {
      return await prisma.category.findMany({
        include: {
          tasks: {
            select: {
              id: true,
              title: true,
              status: true,
            }
          }
        }
      });
    } catch (error) {
      console.error('获取分类失败:', error);
      throw new Error('获取分类失败');
    }
  });

  // 创建分类
  ipcMain.handle('create-category', async (_, data) => {
    try {
      return await prisma.category.create({
        data
      });
    } catch (error) {
      console.error('创建分类失败:', error);
      throw new Error('创建分类失败');
    }
  });

  // 更新分类
  ipcMain.handle('update-category', async (_, { id, data }) => {
    try {
      return await prisma.category.update({
        where: { id },
        data
      });
    } catch (error) {
      console.error('更新分类失败:', error);
      throw new Error('更新分类失败');
    }
  });

  // 删除分类
  ipcMain.handle('delete-category', async (_, id) => {
    try {
      // 先解除关联的任务
      await prisma.task.updateMany({
        where: { categoryId: id },
        data: { categoryId: null }
      });

      // 然后删除分类
      return await prisma.category.delete({
        where: { id }
      });
    } catch (error) {
      console.error('删除分类失败:', error);
      throw new Error('删除分类失败');
    }
  });
}

// 应用关闭时断开数据库连接
app.on('before-quit', async () => {
  await prisma.$disconnect()
})
