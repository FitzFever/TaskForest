import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Settings, defaultSettings, ThemeType, TaskViewType, RenderQuality } from '../types/Settings';

// 设置状态接口
export interface SettingsState {
  settings: Settings;
}

// 设置操作接口
interface SettingsActions {
  // 更新全部设置
  setSettings: (settings: Settings) => void;
  
  // 更新主题
  setTheme: (theme: ThemeType) => void;
  
  // 更新通知设置
  setNotifications: (enabled: boolean) => void;
  setDueDateReminder: (hours: number) => void;
  setDailyDigest: (enabled: boolean) => void;
  
  // 更新显示设置
  setTaskListView: (view: TaskViewType) => void;
  setSortField: (field: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // 更新森林设置
  setRenderQuality: (quality: RenderQuality) => void;
  setAutoRotate: (enabled: boolean) => void;
  setWeatherEffects: (enabled: boolean) => void;
  setAmbientSound: (enabled: boolean) => void;
  
  // 重置设置
  resetSettings: () => void;
}

// 组合设置状态和操作
export type SettingsStore = SettingsState & SettingsActions;

// 创建store，并使用persist中间件持久化存储设置
const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // 初始状态
      settings: defaultSettings,
      
      // 操作实现
      setSettings: (settings) => set({ settings }),
      
      setTheme: (theme) => set((state) => ({
        settings: {
          ...state.settings,
          theme
        }
      })),
      
      setNotifications: (enabled) => set((state) => ({
        settings: {
          ...state.settings,
          notificationsEnabled: enabled
        }
      })),
      
      setDueDateReminder: (hours) => set((state) => ({
        settings: {
          ...state.settings,
          dueDateReminderHours: hours
        }
      })),
      
      setDailyDigest: (enabled) => set((state) => ({
        settings: {
          ...state.settings,
          dailyDigestEnabled: enabled
        }
      })),
      
      setTaskListView: (view) => set((state) => ({
        settings: {
          ...state.settings,
          taskListView: view
        }
      })),
      
      setSortField: (field) => set((state) => ({
        settings: {
          ...state.settings,
          defaultSortField: field
        }
      })),
      
      setSortOrder: (order) => set((state) => ({
        settings: {
          ...state.settings,
          defaultSortOrder: order
        }
      })),
      
      setRenderQuality: (quality) => set((state) => ({
        settings: {
          ...state.settings,
          renderQuality: quality
        }
      })),
      
      setAutoRotate: (enabled) => set((state) => ({
        settings: {
          ...state.settings,
          autoRotate: enabled
        }
      })),
      
      setWeatherEffects: (enabled) => set((state) => ({
        settings: {
          ...state.settings,
          weatherEffects: enabled
        }
      })),
      
      setAmbientSound: (enabled) => set((state) => ({
        settings: {
          ...state.settings,
          ambientSound: enabled
        }
      })),
      
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'taskforest-settings', // localStorage 的 key
      partialize: (state) => ({ settings: state.settings }), // 只持久化 settings 字段
    }
  )
);

export default useSettingsStore; 