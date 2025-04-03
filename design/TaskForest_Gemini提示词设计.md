# TaskForest Gemini 3D视觉资源生成提示词设计

本文档收集了TaskForest项目所需的所有3D视觉资源的Gemini生成提示词。这些提示词经过精心设计，以确保生成的资源具有统一的视觉风格，并符合产品设计要求。

## 设计原则

1. **视觉风格统一性**
   - 介于现实和风格化之间的表现手法
   - 保持清晰、现代的美术风格
   - 确保专业的生产力工具气质

2. **技术规范**
   - 适中的模型多边形数量
   - 清晰但不过分复杂的材质和纹理
   - 预留动画和特效接入点

3. **色彩规范**
   - 主色调：自然的绿色系
   - 强调色：任务类型对应的特征色
   - 状态色：反映树木生命状态的色彩变化

## 一、基础树木模型提示词

### 1.1 橡树（日常任务）
```
A majestic oak tree in a 3D style, with a strong trunk and widespread branches. The leaves are lush green and dense. The tree has a realistic but slightly stylized appearance, perfect for a game environment. The tree should look stable and reliable, symbolizing daily tasks. Include different growth stages from sapling to mature tree. Soft ambient lighting, clean 3D rendering, high quality textures.
```

### 1.2 松树（重复任务）
```
A tall evergreen pine tree in 3D, with symmetrical branches and deep green needles. The tree has a conical shape and upright posture. The texture should show detailed bark and needle clusters. The style should be clean and modern, suitable for a game interface. Include variations showing different growth stages. Soft natural lighting, high-quality 3D model with attention to detail.
```

### 1.3 樱花树（重要任务）
```
A beautiful 3D cherry blossom tree with delicate pink flowers. The branches should have an elegant, flowing form. The tree should capture the ephemeral beauty of sakura, with some petals floating in the air. The style should be slightly stylized but maintain natural proportions. Include different blooming stages. Soft, dreamy lighting with subtle ambient occlusion, high-quality 3D rendering with attention to flower details.
```

### 1.4 棕榈树（休闲任务）
```
A 3D palm tree with a relaxed, tropical appearance. The trunk should have a natural curve, with large green fronds at the top. The style should be cheerful and inviting, perfect for representing leisure tasks. Include different growth stages from small to full size. Bright, warm lighting with soft shadows, clean 3D modeling with detailed textures for the trunk and leaves.
```

### 1.5 苹果树（学习任务）
```
A 3D apple tree with a balanced, nurturing appearance. The tree should have a round, full crown with visible fruits. The style should be educational and rewarding, with detailed leaf and fruit textures. Include different growth stages showing fruit development. Clean, crisp rendering with attention to fruit details and leaf textures. The lighting should be bright and encouraging.
```

### 1.6 枫树（工作任务）
```
A 3D maple tree with distinctive leaf shapes and rich autumn colors. The tree should have a professional and organized appearance, with clearly defined branches and elegant proportions. Include color variations from green to red, symbolizing progress. The rendering should be clean and modern, with high-quality leaf textures and smooth trunk mapping.
```

### 1.7 柳树（长期项目任务）
```
A 3D willow tree with graceful, flowing branches. The tree should have a patient, enduring quality with long, sweeping limbs. The style should suggest continuous growth and development. Include different growth stages showing the gradual spread of branches. Soft, atmospheric rendering with detailed branch and leaf textures.
```

### 1.8 稀有树种（特殊成就）
```
A unique 3D fantasy tree with a magical yet professional appearance. The tree should combine natural elements with subtle glowing effects. Include special materials that suggest achievement and rarity. The style should remain clean and modern while incorporating distinctive features. High-quality rendering with special attention to unique visual effects.
```

## 二、树木生命状态提示词

### 2.1 健康状态（0-25%）
```
A vibrant 3D tree with lush, healthy foliage. The leaves should be bright green and full of life. Include subtle animation-ready elements like gently swaying leaves. The tree should emit a soft, natural glow suggesting vitality. Clean, modern 3D rendering with high-quality textures and materials. Particle effects ready for falling leaves or flower petals.
```

### 2.2 轻微枯萎（25-50%）
```
A 3D tree showing early signs of wilting. Some yellowing leaves among the green ones, with slightly drooping branches. The color palette should shift towards muted greens and touches of yellow. Maintain the basic tree structure but with visible signs of stress. Clean 3D rendering with detailed textures showing the transition between healthy and wilting areas.
```

### 2.3 中度枯萎（50-75%）
```
A 3D tree in moderate decline, with significant yellowing and some brown leaves. The branches should show visible drooping, and the trunk texture should appear drier. Include fallen leaves around the base. The overall appearance should clearly show distress while maintaining the tree's basic form. Detailed textures showing bark cracking and leaf discoloration.
```

### 2.4 严重枯萎（75-100%）
```
A 3D tree in severe decline, with mostly brown and falling leaves. The branches should be clearly drooping, and the trunk should show signs of severe stress. Include warning elements like subtle red glowing effects. The textures should show advanced decay while maintaining the tree's recognizable form. High-contrast rendering emphasizing the critical state.
```

## 三、环境场景提示词

### 3.1 基础森林场景
```
A serene 3D forest environment with a clean, modern aesthetic. The scene should include gently rolling grass terrain, subtle atmospheric lighting, and a minimalist sky design. The style should be realistic but slightly stylized, suitable for a productivity app. Include ambient elements like small rocks and paths. The lighting should be soft and calming, with gentle shadows and ambient occlusion.
```

### 3.2 季节变化场景

#### 春季
```
A bright, cheerful 3D forest scene in spring. Include cherry blossom trees with falling petals, fresh green grass, and small flowering plants. The lighting should be soft and warm, creating a hopeful atmosphere. Add subtle particle effects for floating petals and small butterflies. The scene should maintain a clean, modern aesthetic while capturing the essence of spring.
```

#### 夏季
```
A vibrant 3D forest scene in summer. Rich green foliage, bright sunlight filtering through the canopy, and occasional butterflies or bees. The lighting should be strong but not harsh, creating a productive atmosphere. Include subtle heat haze effects and gentle leaf movements. The scene should maintain the professional aesthetic while showing peak growth season.
```

#### 秋季
```
A 3D forest scene in autumn colors, with trees showing various shades of red, orange, and gold. Include falling leaves animation elements and ground coverage of fallen leaves. The lighting should be warm and golden, creating a cozy atmosphere. The scene should maintain the clean, modern aesthetic while showcasing the beauty of fall colors.
```

#### 冬季
```
A peaceful 3D forest scene in winter. Include snow-covered trees, crisp lighting, and occasional snowfall effects. The scene should maintain a professional appearance while capturing the quiet beauty of winter. Add subtle sparkle effects on snow surfaces and gentle snow particle systems. The lighting should be cool and clear, emphasizing the clean winter aesthetic.
```

## 四、特效元素提示词

### 4.1 任务完成特效
```
A 3D particle effect system showing a burst of golden light and floating leaves. The effect should start from the base of a tree and spiral upward. Include small glowing orbs and gentle light rays. The style should be magical but not overly fantasy-like, maintaining a professional productivity app aesthetic. The colors should be warm and celebratory, with a clean, modern look.
```

### 4.2 成就解锁特效
```
A 3D special effect combining light rays, floating symbols, and gentle particle systems. The effect should create a sense of achievement and reward. Include subtle golden sparkles and rising light pillars. The style should be elegant and professional, suitable for a productivity environment. The colors should be rich but not overwhelming, with a focus on gold and white tones.
```

### 4.3 生长过渡特效
```
A smooth 3D growth animation effect showing the transition between tree stages. Include gentle particle effects suggesting vitality and growth. The effect should be natural yet slightly stylized, maintaining the professional app aesthetic. Use soft glowing elements and subtle color transitions to show progress. The animation should be fluid and satisfying to watch.
```

## 生成顺序建议

为确保视觉风格的一致性，建议按照以下顺序生成资源：

1. **基础树木模型**
   - 先生成主干和基本结构
   - 然后是枝叶细节
   - 最后是生长阶段变化

2. **生命状态变体**
   - 从健康状态开始
   - 依次生成各级枯萎状态
   - 确保状态之间的过渡自然

3. **环境场景元素**
   - 先生成基础地形
   - 然后是环境装饰物
   - 最后是季节变化效果

4. **特效元素**
   - 基础粒子效果
   - 成就和奖励特效
   - 状态转换动画

## 注意事项

1. **性能优化**
   - 控制模型面数在合理范围
   - 优化纹理分辨率
   - 合理使用材质数量

2. **风格统一**
   - 保持一致的渲染风格
   - 统一的色彩方案
   - 协调的材质表现

3. **动画预留**
   - 为树木摆动预留骨骼
   - 为特效预留发射点
   - 为状态切换预留过渡帧

---

*本文档由3D视觉设计师林小玲负责维护，将根据生成效果持续优化提示词* 