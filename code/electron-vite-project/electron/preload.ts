import { contextBridge, ipcRenderer } from 'electron'

// 暴露API给渲染进程
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    // 任务相关API
    getTasks: () => ipcRenderer.invoke('get-tasks'),
    createTask: (taskData: any) => ipcRenderer.invoke('create-task', taskData),
    updateTask: (id: number, data: any) => ipcRenderer.invoke('update-task', { id, data }),
    deleteTask: (id: number) => ipcRenderer.invoke('delete-task', id),
    completeTask: (id: number) => ipcRenderer.invoke('complete-task', id),
    
    // 树木相关API
    getTrees: () => ipcRenderer.invoke('get-trees'),
    createTree: (data: any) => ipcRenderer.invoke('create-tree', data),
    growTree: (id: number) => ipcRenderer.invoke('grow-tree', id),
    
    // 分类相关API
    getCategories: () => ipcRenderer.invoke('get-categories'),
    createCategory: (data: any) => ipcRenderer.invoke('create-category', data),
    updateCategory: (id: number, data: any) => ipcRenderer.invoke('update-category', { id, data }),
    deleteCategory: (id: number) => ipcRenderer.invoke('delete-category', id),
    
    // 通用方法
    invoke: (channel: string, ...args: any[]) => {
      // 限制允许的通道
      const validChannels = [
        'get-tasks',
        'create-task',
        'update-task',
        'delete-task',
        'complete-task',
        'get-trees',
        'create-tree',
        'grow-tree',
        'get-categories',
        'create-category',
        'update-category',
        'delete-category',
      ]
      
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args)
      }
      
      return Promise.reject(new Error(`通道 "${channel}" 不在允许列表中`))
    },
    
    // 侦听主进程消息
    on: (channel: string, callback: (...args: any[]) => void) => {
      // 限制允许的通道
      const validChannels = [
        'main-process-message',
        'task-updated',
        'tree-updated'
      ]
      
      if (validChannels.includes(channel)) {
        // 转换函数为可接受的格式并移除上一个监听器
        const subscription = (_event: any, ...args: any[]) => callback(...args)
        ipcRenderer.on(channel, subscription)
        
        // 返回清理函数
        return () => {
          ipcRenderer.removeListener(channel, subscription)
        }
      }
      
      console.error(`通道 "${channel}" 不在允许列表中`)
      return () => {}
    },
    
    // 发送消息到主进程
    send: (channel: string, ...args: any[]) => {
      // 限制允许的通道
      const validChannels = [
        'from-renderer',
        'refresh-tasks',
        'refresh-trees'
      ]
      
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, ...args)
      } else {
        console.error(`通道 "${channel}" 不在允许列表中`)
      }
    }
  }
})

// 当页面加载时通知主进程
window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.send('from-renderer', 'Preload script loaded')
})

function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise(resolve => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = ev => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 4999) 