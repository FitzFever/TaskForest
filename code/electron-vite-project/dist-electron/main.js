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
      const createdTask = await prisma.task.create({
        data: taskData,
        include: {
          category: true
        }
      });
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
        });
        await prisma.task.update({
          where: { id: createdTask.id },
          data: { treeId: tree.id }
        });
      }
      return createdTask;
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
  electron.ipcMain.handle("complete-task", async (_, id) => {
    try {
      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          status: "已完成",
          completedAt: /* @__PURE__ */ new Date()
        },
        include: {
          tree: true
        }
      });
      if (updatedTask.tree) {
        await prisma.tree.update({
          where: { id: updatedTask.tree.id },
          data: { growthStage: 5 }
        });
      }
      return updatedTask;
    } catch (error) {
      console.error("完成任务失败:", error);
      throw new Error("完成任务失败");
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
