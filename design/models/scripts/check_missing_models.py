#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TaskForest 3D模型文件检查脚本
用于检查缺失的模型文件，并生成缺失模型的列表

使用方法:
python check_missing_models.py ../export/trees
"""

import os
import sys
import glob
import json
from collections import defaultdict

# 定义树木类型列表
TREE_TYPES = ['oak', 'pine', 'cherry', 'apple', 'maple', 'willow', 'palm']

# 定义生长阶段
GROWTH_STAGES = {
    'seed': 'seedstage_{}',
    'sapling': '{}_sapling',
    'growing': '{}_growing',
    'mature': '{}_mature'
}

# 定义健康状态模型
HEALTH_MODELS = [
    'healthy_tree',
    'slightly_wilted_tree',
    'moderately_wilted_tree',
    'severely_wilted_tree'
]

def check_models(models_dir):
    """检查模型文件是否存在"""
    print(f"检查目录: {models_dir}")
    
    # 获取目录中的所有GLB文件
    existing_files = glob.glob(os.path.join(models_dir, '*.glb'))
    existing_filenames = [os.path.basename(f).lower() for f in existing_files]
    
    print(f"找到 {len(existing_filenames)} 个模型文件")
    
    # 检查结果
    results = defaultdict(lambda: defaultdict(bool))
    missing_files = []
    complete_tree_types = []
    
    # 检查每种树木的每个阶段
    for tree_type in TREE_TYPES:
        complete = True
        
        # 检查通用模型（不指定生长阶段）
        generic_model = f"{tree_type}.glb"
        results[tree_type]['generic'] = generic_model.lower() in existing_filenames
        if not results[tree_type]['generic']:
            missing_files.append(generic_model)
            complete = False
        
        # 检查各个生长阶段
        for stage, pattern in GROWTH_STAGES.items():
            model_name = f"{pattern.format(tree_type)}.glb"
            results[tree_type][stage] = model_name.lower() in existing_filenames
            if not results[tree_type][stage]:
                missing_files.append(model_name)
                complete = False
        
        if complete:
            complete_tree_types.append(tree_type)
    
    # 检查健康状态模型
    health_models_results = {}
    for model in HEALTH_MODELS:
        model_name = f"{model}.glb"
        health_models_results[model] = model_name.lower() in existing_filenames
        if not health_models_results[model]:
            missing_files.append(model_name)
    
    # 返回结果
    return {
        'results': dict(results),
        'missing_files': missing_files,
        'complete_tree_types': complete_tree_types,
        'health_models': health_models_results
    }

def generate_report(results, output_file=None):
    """生成检查报告"""
    missing_files = results['missing_files']
    complete_tree_types = results['complete_tree_types']
    
    print("\n=== TaskForest 3D模型检查报告 ===")
    
    # 完整树木类型
    print(f"\n完整的树木类型 ({len(complete_tree_types)}/{len(TREE_TYPES)}):")
    if complete_tree_types:
        for tree_type in complete_tree_types:
            print(f"  ✅ {tree_type}")
    else:
        print("  ❌ 没有完整的树木类型")
    
    # 缺失的模型文件
    print(f"\n缺失的模型文件 ({len(missing_files)}):")
    if missing_files:
        for filename in missing_files:
            print(f"  ❌ {filename}")
    else:
        print("  ✅ 没有缺失的模型文件")
    
    # 详细结果
    print("\n详细检查结果:")
    for tree_type in TREE_TYPES:
        print(f"\n{tree_type.upper()}:")
        print(f"  通用模型: {'✅' if results['results'][tree_type]['generic'] else '❌'}")
        for stage in GROWTH_STAGES.keys():
            print(f"  {stage}: {'✅' if results['results'][tree_type][stage] else '❌'}")
    
    # 健康状态模型
    print("\n健康状态模型:")
    for model, exists in results['health_models'].items():
        print(f"  {model}: {'✅' if exists else '❌'}")
    
    # 保存报告到文件
    if output_file:
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\n报告已保存到: {output_file}")
    
    # 总结
    complete_count = len(complete_tree_types)
    total_count = len(TREE_TYPES)
    complete_percentage = complete_count / total_count * 100
    
    print(f"\n总结: {complete_count}/{total_count} ({complete_percentage:.1f}%) 树木类型完整")
    if missing_files:
        print(f"需要创建 {len(missing_files)} 个缺失的模型文件")
    else:
        print("所有模型文件已完成!")

def main():
    """主函数"""
    # 检查命令行参数
    if len(sys.argv) < 2:
        print("使用方法: python check_missing_models.py <模型目录> [报告输出文件]")
        sys.exit(1)
    
    models_dir = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    # 检查目录是否存在
    if not os.path.isdir(models_dir):
        print(f"错误: 目录 '{models_dir}' 不存在")
        sys.exit(1)
    
    # 检查模型
    results = check_models(models_dir)
    
    # 生成报告
    generate_report(results, output_file)

if __name__ == "__main__":
    main() 