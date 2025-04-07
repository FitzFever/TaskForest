// 设置测试环境

// 模拟 window.electron 对象
global.window = global.window || {};
window.electron = {
  // Tree相关方法
  getTrees: jest.fn().mockImplementation(() => Promise.resolve([])),
  createTree: jest.fn().mockImplementation((tree) => Promise.resolve({ id: 1, ...tree })),
  growTree: jest.fn().mockImplementation((treeId) => Promise.resolve(true)),
  deleteTree: jest.fn().mockImplementation((treeId) => Promise.resolve(true)),
  
  // Task相关方法
  getTasks: jest.fn().mockImplementation(() => Promise.resolve([])),
  createTask: jest.fn().mockImplementation((task) => Promise.resolve({ id: 1, ...task })),
  updateTask: jest.fn().mockImplementation((taskId, task) => Promise.resolve({ id: taskId, ...task })),
  deleteTask: jest.fn().mockImplementation((taskId) => Promise.resolve(true)),
  completeTask: jest.fn().mockImplementation((taskId) => Promise.resolve({ id: taskId, completed: true })),
  
  // 通用IPC方法
  send: jest.fn(),
  on: jest.fn(),
  invoke: jest.fn()
};

// 模拟控制台以消除噪音
const originalConsoleError = console.error;
console.error = jest.fn().mockImplementation((...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning:') || args[0].includes('Error:'))
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
});

// 模拟matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}); 