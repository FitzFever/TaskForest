"use strict";
const electron = require("electron");
const node_url = require("node:url");
const path = require("node:path");
const require$$0 = require(".prisma/client/index-browser");
var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
const prisma$1 = require$$0;
var indexBrowser = prisma$1;
const currentDir = path.dirname(node_url.fileURLToPath(typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("main.js", document.baseURI).href));
const DIST = path.join(currentDir, "../dist");
electron.app.isPackaged ? DIST : path.join(currentDir, "../public");
let mainWindow = null;
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
const prisma = new indexBrowser.PrismaClient();
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(currentDir, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow == null ? void 0 : mainWindow.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(DIST, "index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
    mainWindow = null;
  }
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
electron.app.whenReady().then(() => {
  createWindow();
  const modelsDir = path.join(
    process.env.VITE_DEV_SERVER_URL ? path.resolve(__dirname, "../../models") : path.join(electron.app.getAppPath(), "models")
  );
  console.log("Models目录:", modelsDir);
  setupIpcHandlers();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
function setupIpcHandlers() {
  electron.ipcMain.handle("get-tasks", async () => {
    try {
      return await prisma.task.findMany({
        include: {
          category: true,
          tree: true
        }
      });
    } catch (error) {
      console.error("获取任务失败:", error);
      throw new Error("获取任务失败");
    }
  });
  electron.ipcMain.handle("create-task", async (_, taskData) => {
    try {
<<<<<<< HEAD
      const createdTask = await prisma.task.create({
        data: taskData,
=======
      if (!prisma) {
        console.error("Prisma客户端未初始化，尝试重新初始化...");
        await initDatabase();
        if (!prisma) {
          throw new Error("数据库连接不可用");
        }
      }
      if (!taskData.title) {
        console.error("任务标题不能为空");
        throw new Error("任务标题不能为空");
      }
      console.log("开始在数据库中创建任务...");
      const taskCreateData = {
        title: taskData.title,
        description: taskData.description || "",
        type: taskData.type || "REGULAR",
        status: taskData.status || "TODO",
        priority: taskData.priority || "MEDIUM",
        treeType: taskData.treeType || "oak",
        growthStage: 1,
        // 初始生长阶段为1
        tags: taskData.tags ? JSON.stringify(taskData.tags) : "[]",
        dueDate: taskData.deadline ? new Date(taskData.deadline) : null
      };
      console.log("格式化后的任务数据:", JSON.stringify(taskCreateData, null, 2));
      const createdTask = await prisma.task.create({
        data: taskCreateData,
>>>>>>> d53a2f1 (reconstruction)
        include: {
          tree: true
        }
      });
<<<<<<< HEAD
      if (taskData.treeType) {
        const tree = await prisma.tree.create({
          data: {
            type: taskData.treeType,
            position: `${Math.random() * 10 - 5},0,${Math.random() * 10 - 5}`,
=======
      console.log("任务基本信息创建成功:", JSON.stringify(createdTask, null, 2));
      console.log(`创建关联的树木，类型: ${taskCreateData.treeType}, 任务ID: ${createdTask.id}`);
      try {
        const posX = Math.random() * 20 - 10;
        const posZ = Math.random() * 20 - 10;
        const tree = await prisma.tree.create({
          data: {
            type: taskCreateData.treeType || "oak",
            stage: 1,
            positionX: posX,
            positionY: 0,
            positionZ: posZ,
            rotationY: Math.random() * Math.PI * 2,
>>>>>>> d53a2f1 (reconstruction)
            task: {
              connect: {
                id: createdTask.id
              }
            }
          }
        });
<<<<<<< HEAD
        await prisma.task.update({
          where: { id: createdTask.id },
          data: { treeId: tree.id }
        });
      }
      return createdTask;
=======
        console.log("树木创建成功:", JSON.stringify(tree, null, 2));
        const taskWithTree = await prisma.task.findUnique({
          where: { id: createdTask.id },
          include: { tree: true }
        });
        console.log("返回完整任务数据:", JSON.stringify(taskWithTree, null, 2));
        return taskWithTree;
      } catch (treeError) {
        console.error("创建树木失败:", treeError);
        return createdTask;
      }
>>>>>>> d53a2f1 (reconstruction)
    } catch (error) {
      console.error("创建任务失败:", error);
      throw new Error("创建任务失败");
    }
  });
  electron.ipcMain.handle("update-task", async (_, { id, data }) => {
    try {
      return await prisma.task.update({
        where: { id },
        data,
        include: {
          category: true,
          tree: true
        }
      });
    } catch (error) {
      console.error("更新任务失败:", error);
      throw new Error("更新任务失败");
    }
  });
  electron.ipcMain.handle("delete-task", async (_, id) => {
    try {
      await prisma.tree.deleteMany({
        where: { taskId: id }
      });
      return await prisma.task.delete({
        where: { id }
      });
    } catch (error) {
      console.error("删除任务失败:", error);
      throw new Error("删除任务失败");
    }
  });
  electron.ipcMain.handle("complete-task", async (event, taskId) => {
    console.log("==================== 接收到complete-task请求 ====================");
    console.log("请求来源:", event.sender.getURL());
    console.log("任务ID:", taskId);
    try {
      if (!prisma) {
        console.error("Prisma客户端未初始化");
        throw new Error("数据库连接不可用");
      }
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { tree: true }
      });
      if (!task) {
        console.error(`任务不存在: ${taskId}`);
        throw new Error("任务不存在");
      }
      console.log("找到任务:", JSON.stringify(task, null, 2));
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          status: "COMPLETED",
          completedAt: /* @__PURE__ */ new Date()
        },
        include: { tree: true }
      });
      console.log("任务已标记为完成:", JSON.stringify(updatedTask, null, 2));
      if (task.tree) {
        console.log("更新树木生长阶段:", task.tree.id);
        const currentStage = task.tree.stage || 0;
        const newStage = Math.min(currentStage + 1, 5);
        const updatedTree = await prisma.tree.update({
          where: { id: task.tree.id },
          data: {
            stage: newStage,
            lastGrowth: /* @__PURE__ */ new Date()
          }
        });
        console.log("树木生长阶段已更新:", JSON.stringify(updatedTree, null, 2));
      }
      const finalTask = await prisma.task.findUnique({
        where: { id: taskId },
        include: { tree: true }
      });
      console.log("返回最终任务数据:", JSON.stringify(finalTask, null, 2));
      return finalTask;
    } catch (error) {
      console.error("完成任务失败:", error);
      throw new Error(`完成任务失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  });
  electron.ipcMain.handle("get-trees", async () => {
    try {
      return await prisma.tree.findMany({
        include: {
          task: true
        }
      });
    } catch (error) {
      console.error("获取树木失败:", error);
      throw new Error("获取树木失败");
    }
  });
  electron.ipcMain.handle("create-tree", async (_, data) => {
    try {
      let prismaData = { ...data };
      if (data.taskId) {
        const { taskId, ...restData } = data;
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
      console.error("创建树木失败:", error);
      throw new Error("创建树木失败");
    }
  });
  electron.ipcMain.handle("grow-tree", async (_, id) => {
    try {
      const tree = await prisma.tree.findUnique({
        where: { id }
      });
      if (!tree) {
        throw new Error("树木不存在");
      }
      const newGrowthStage = Math.min(tree.growthStage + 1, 5);
      return await prisma.tree.update({
        where: { id },
        data: {
          growthStage: newGrowthStage
        }
      });
    } catch (error) {
      console.error("更新树木生长阶段失败:", error);
      throw new Error("更新树木生长阶段失败");
    }
  });
  electron.ipcMain.handle("get-categories", async () => {
    try {
      return await prisma.category.findMany({
        include: {
          tasks: {
            select: {
              id: true,
              title: true,
              status: true
            }
          }
        }
      });
    } catch (error) {
      console.error("获取分类失败:", error);
      throw new Error("获取分类失败");
    }
  });
  electron.ipcMain.handle("create-category", async (_, data) => {
    try {
      return await prisma.category.create({
        data
      });
    } catch (error) {
      console.error("创建分类失败:", error);
      throw new Error("创建分类失败");
    }
  });
  electron.ipcMain.handle("update-category", async (_, { id, data }) => {
    try {
      return await prisma.category.update({
        where: { id },
        data
      });
    } catch (error) {
      console.error("更新分类失败:", error);
      throw new Error("更新分类失败");
    }
  });
  electron.ipcMain.handle("delete-category", async (_, id) => {
    try {
      await prisma.task.updateMany({
        where: { categoryId: id },
        data: { categoryId: null }
      });
      return await prisma.category.delete({
        where: { id }
      });
    } catch (error) {
      console.error("删除分类失败:", error);
      throw new Error("删除分类失败");
    }
  });
}
electron.app.on("before-quit", async () => {
  await prisma.$disconnect();
});
