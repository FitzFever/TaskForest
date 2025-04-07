import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始数据库初始化...');

  // 默认分类
  const defaultCategories = [
    { name: '工作', color: '#1890ff' },
    { name: '学习', color: '#52c41a' },
    { name: '生活', color: '#fa8c16' },
    { name: '健康', color: '#eb2f96' },
    { name: '娱乐', color: '#722ed1' },
    { name: '社交', color: '#faad14' },
    { name: '个人发展', color: '#13c2c2' },
  ];

  console.log('创建默认分类...');

  // 清理现有分类
  await prisma.category.deleteMany();
  
  // 创建默认分类
  for (const category of defaultCategories) {
    await prisma.category.create({
      data: category,
    });
  }

  console.log('默认分类创建完成!');
  
  // 示例树木（用于测试）
  console.log('创建示例树木...');
  
  // 清理现有任务和树木
  await prisma.task.deleteMany();
  await prisma.tree.deleteMany();

  // 创建示例任务和树木
  const taskTypes = ['oak', 'pine', 'cherry', 'palm', 'apple', 'maple', 'willow'];
  const categories = await prisma.category.findMany();
  
  for (let i = 0; i < 7; i++) {
    const treeType = taskTypes[i % taskTypes.length];
    const growthStage = Math.min(5, Math.floor(Math.random() * 5) + 1);
    const category = categories[i % categories.length];
    
    // 创建树木
    const tree = await prisma.tree.create({
      data: {
        type: treeType,
        growthStage,
        position: `${Math.random() * 10 - 5},0,${Math.random() * 10 - 5}`,
      },
    });
    
    // 创建关联的任务
    await prisma.task.create({
      data: {
        title: `示例任务 ${i + 1}`,
        description: `这是一个${growthStage >= 5 ? '已完成' : '进行中'}的示例任务`,
        status: growthStage >= 5 ? '已完成' : '进行中',
        priority: ['低', '中', '高'][Math.floor(Math.random() * 3)],
        categoryId: category.id,
        treeId: tree.id,
        completedAt: growthStage >= 5 ? new Date() : null,
      },
    });
  }

  console.log('示例数据创建完成!');
  console.log('数据库初始化完成!');
}

main()
  .catch((e) => {
    console.error('初始化过程中出错:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 