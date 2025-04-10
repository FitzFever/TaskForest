# TaskForest产品说明文档

## 1. 产品定位
TaskForest是一款将任务管理与游戏化体验完美结合的桌面应用。通过将任务转化为树木的生长过程，为用户提供直观、有趣且富有成就感的任务管理体验。

## 2. 核心价值主张
- **视觉化任务管理**：将抽象的任务转化为具象的树木生长过程
- **游戏化激励机制**：通过收集不同树种、解锁稀有树木来激励用户完成任务
- **智能任务拆解**：利用AI技术帮助用户更好地规划和执行复杂任务
- **沉浸式体验**：3D森林场景提供独特的任务管理环境

## 3. 游戏化机制设计

### 3.1 树木系统
#### 基础树木类型
1. **橡树**
   - 对应：普通日常任务
   - 特点：生长稳定，适应性强
   - 解锁条件：默认解锁

2. **松树**
   - 对应：定期重复任务
   - 特点：四季常青，象征坚持
   - 解锁条件：完成3个重复任务

3. **樱花树**
   - 对应：重要任务
   - 特点：花期短暂，象征珍贵
   - 解锁条件：完成5个重要任务

4. **棕榈树**
   - 对应：休闲类任务
   - 特点：热带风情，轻松愉快
   - 解锁条件：完成10个休闲任务

5. **苹果树**
   - 对应：学习类任务
   - 特点：果实累累，象征收获
   - 解锁条件：完成5个学习任务

6. **枫树**
   - 对应：工作类任务
   - 特点：秋色绚烂，象征成就
   - 解锁条件：完成8个工作任务

7. **柳树**
   - 对应：长期项目任务
   - 特点：枝繁叶茂，象征成长
   - 解锁条件：完成1个持续30天以上的任务

8. **稀有树种**
   - 对应：特殊成就任务
   - 特点：独特外观，象征荣誉
   - 解锁条件：完成特定挑战或成就

### 3.2 生长机制
#### 树木生命状态
1. **健康状态**（0-25%）
   - 视觉表现：枝繁叶茂，生机勃勃
   - 触发条件：任务进度正常，距离DDL充足
   - 特点：树木生长旺盛，叶片翠绿

2. **轻微枯萎**（25-50%）
   - 视觉表现：部分叶片发黄，生长减缓
   - 触发条件：任务进度落后，距离DDL较近
   - 特点：树木活力下降，但仍有生机

3. **中度枯萎**（50-75%）
   - 视觉表现：大量叶片发黄，枝干干枯
   - 触发条件：任务严重延期，接近DDL
   - 特点：树木明显缺乏活力，生长停滞

4. **严重枯萎**（75-100%）
   - 视觉表现：叶片脱落，枝干干裂
   - 触发条件：任务严重延期，超过DDL
   - 特点：树木濒临死亡，急需抢救

#### 生命状态计算机制
1. **基础生命值计算**
   - 初始生命值：100%
   - 生命值衰减速度 = 距离DDL时间 / 任务总时长
   - 任务进度影响：
     - 进度正常：生命值维持
     - 进度落后：生命值加速衰减
     - 进度超前：生命值恢复

2. **状态转换规则**
   - 健康→轻微枯萎：生命值降至75%
   - 轻微枯萎→中度枯萎：生命值降至50%
   - 中度枯萎→严重枯萎：生命值降至25%
   - 严重枯萎→死亡：生命值降至0%

3. **生命值恢复机制**
   - 更新任务进度：生命值立即恢复20%
   - 提前完成任务：生命值恢复至100%
   - 调整DDL：根据新DDL重新计算生命值
   - 任务完成：树木恢复至完全健康状态

4. **特殊状态效果**
   - 濒死状态：树木呈现红色警示效果
   - 恢复状态：树木呈现绿色治愈效果
   - 死亡状态：树木呈现灰色，可重新种植

### 3.3 任务状态与树木表现
1. **进行中任务**
   - 健康状态：正常生长
   - 枯萎状态：生长停滞
   - 濒死状态：需要及时处理

2. **已完成任务**
   - 树木保持健康状态
   - 显示完成时间标记
   - 可查看任务历史

3. **延期任务**
   - 根据延期程度显示不同枯萎状态
   - 提供延期原因记录
   - 支持重新激活机制

4. **已取消任务**
   - 树木消失
   - 保留任务记录
   - 可重新创建任务

### 3.4 奖励系统
1. **成就徽章**
   - 首次完成任务
   - 连续完成任务
   - 解锁新树种
   - 森林规模达到特定数量

2. **特殊效果**
   - 完成任务时的粒子效果
   - 树木生长时的动画效果
   - 解锁新树种时的庆祝效果

3. **森林装饰**
   - 小动物装饰
   - 季节变化效果
   - 特殊天气效果

## 4. 任务管理系统

### 4.1 任务创建
- 支持快速创建简单任务
- 支持AI辅助拆解复杂任务
- 可设置任务优先级和截止日期
- 支持任务分类和标签

### 4.2 任务追踪
- 实时显示任务完成进度
- 树木生长状态同步更新
- 任务提醒和通知系统
- 任务延期处理机制

### 4.3 数据统计
- 任务完成率统计
- 每日/周/月任务趋势
- 不同类型任务分布
- 时间投入分析

## 5. AI智能助手

### 5.1 任务拆解
- 智能分析复杂任务
- 自动生成子任务
- 推荐任务执行顺序
- 预估任务完成时间

### 5.2 个性化建议
- 基于历史数据的任务建议
- 智能提醒和通知
- 任务优化建议
- 时间管理建议

## 6. 用户界面设计

### 6.1 主要界面
1. **任务创建区**
   - 简洁的任务输入表单
   - AI辅助任务拆解界面
   - 任务分类和标签管理

2. **森林展示区**
   - 3D森林场景
   - 树木生长状态展示
   - 互动式浏览控制

3. **数据统计区**
   - 任务完成统计图表
   - 森林成长历史记录
   - 成就展示面板

### 6.2 交互设计
- 流畅的3D场景操作
- 直观的任务管理操作
- 清晰的视觉反馈
- 简洁的信息展示

## 7. 产品特色

### 7.1 核心优势
- 独特的视觉化任务管理体验
- 丰富的游戏化激励机制
- 智能的AI辅助功能
- 精美的3D视觉效果

### 7.2 差异化特点
- 将任务管理与自然生长相结合
- 提供沉浸式的任务管理环境
- 支持个性化森林定制
- 智能化的任务管理助手

## 8. 核心交互流程与玩法过程

### 8.1 用户核心路径
1. **初次进入应用**
   - 欢迎界面展示产品简介
   - 引导用户创建第一个任务
   - 赠送用户第一颗种子（橡树）
   - 简短教程讲解基本操作

2. **创建任务流程**
   - 点击"+"按钮进入任务创建界面
   - 输入任务标题（必填）
   - 选择任务类型（决定树木种类）
   - 设置任务截止日期（必填）
   - 设置任务优先级（可选）
   - 选择是否需要AI拆解（复杂任务）
   - 确认创建，获得对应类型的种子

3. **任务执行与完成**
   - 从任务列表中选择要执行的任务
   - 系统自动根据DDL计算树木生长速度
   - 任务进行中，树木按时间比例生长
   - 任务完成，点击"完成"按钮
   - 树木立即达到完全成熟状态
   - 树木被种植到用户的森林中

4. **森林互动流程**
   - 切换到"森林"标签页
   - 360°自由查看自己的森林
   - 点击单棵树木查看对应的任务信息
   - 缩放和平移视角探索森林
   - 选择时间段筛选树木（按月/季/年）
   - 触摸树木激活特效动画

### 8.2 核心玩法循环
1. **日常任务循环**
   - 创建任务并设置DDL → 获得种子
   - 任务进行中 → 树木随时间生长
   - 完成任务 → 树木完全成熟
   - 树木加入森林 → 视觉成就感
   - 解锁新树种 → 激励创建更多任务

2. **成长与成就循环**
   - 持续完成任务 → 森林不断扩大
   - 达成特定目标 → 解锁成就徽章
   - 收集徽章 → 解锁特殊树种和装饰
   - 展示个性化森林 → 成就感与满足感

3. **提升循环**
   - 使用AI拆解复杂任务 → 提高任务完成效率
   - 完成更多任务 → 获得数据洞察
   - 查看统计分析 → 了解个人习惯
   - 优化任务管理策略 → 进一步提高效率

### 8.3 关键场景交互示例

#### 场景一：任务延期与恢复
1. 用户创建任务"准备会议材料"，设置DDL为明天上午10点
2. 系统创建柳树，初始状态健康
3. 到DDL时间任务未完成，树木开始枯萎
4. 用户更新任务进度，树木恢复部分生命力
5. 用户选择延长DDL，树木状态重新计算
6. 最终完成任务，树木恢复至健康状态

#### 场景二：紧急任务处理
1. 用户创建任务"提交项目报告"，设置DDL为今天下午3点
2. 系统创建樱花树，初始状态健康
3. 下午2点任务未完成，树木呈现严重枯萎状态
4. 树木显示红色警示效果
5. 用户快速完成任务，树木立即恢复生机
6. 系统显示"任务完成！樱花树已恢复健康"

#### 场景三：AI拆解复杂项目
1. 用户创建任务"准备季度报告"，标记为长期项目
2. 选择"AI拆解"选项，系统调用AI助手
3. AI分析任务，建议拆分为5个子任务：
   - "收集季度数据"
   - "分析销售趋势"
   - "制作数据可视化"
   - "撰写报告文稿"
   - "准备演示文稿"
4. 用户确认拆解结果，系统创建1棵主柳树和5颗种子
5. 每完成一个子任务，对应种子生长为小树
6. 所有子任务完成后，主柳树完全成长，森林中出现柳树群落

#### 场景四：森林浏览与回顾
1. 用户进入"森林"界面，看到自己的任务森林
2. 系统默认展示当月完成的任务树木
3. 用户可通过时间轴选择查看过去任何时期的森林
4. 点击某棵樱花树，弹出信息："重要任务 - 提交项目企划，完成于2023年3月15日"
5. 用户使用手势缩放查看森林全景
6. 双击地面特定区域，相机自动移动至该区域
7. 使用筛选器选择"只显示学习任务"，只有苹果树保持高亮显示

### 8.4 奖励与进阶玩法
1. **连续完成挑战**
   - 系统追踪连续完成任务的天数
   - 达到7/30/100天里程碑时解锁特殊徽章
   - 连续30天解锁稀有树种"星光树"

2. **季节主题**
   - 系统根据实际季节改变森林环境
   - 春季：樱花飘落效果
   - 夏季：明亮阳光和蝴蝶
   - 秋季：落叶和金黄色调
   - 冬季：雪景和节日装饰

3. **成就解锁系统**
   - "初学者园丁"：完成首个任务
   - "专注能手"：累计专注时间达100小时
   - "森林守护者"：森林中拥有100棵树
   - "收藏家"：解锁所有基础树种

## 9. 后续规划

### 9.1 功能扩展
- 社交功能：好友森林参观
- 成就系统扩展
- 更多树木和环境主题
- 云同步功能

### 9.2 技术升级
- VR/AR森林体验
- 更智能的AI助手
- 跨平台同步
- 性能优化

---
*本文档由产品设计师王芳负责维护，将根据产品开发进展持续更新* 