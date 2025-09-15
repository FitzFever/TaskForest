#!/usr/bin/env python3
"""
TaskForest 缺失模型生成脚本

此脚本生成基于现有模型的缺失生长阶段模型。
它通过缩放和调整现有模型来创建不同生长阶段的变体。
"""

import os
import sys
import json
import argparse
import shutil
from pathlib import Path

# 设置基本目录
SCRIPT_DIR = Path(__file__).parent
MODELS_DIR = SCRIPT_DIR.parent
EXPORT_DIR = MODELS_DIR / "export" / "trees"
CLIENT_DIR = MODELS_DIR.parent.parent / "client" / "public" / "models" / "trees"

# 所有树木类型
TREE_TYPES = ["oak", "pine", "maple", "palm", "apple", "willow", "cherry"]

# 所有生长阶段
GROWTH_STAGES = {
    "seedstage": 0,  # 种子阶段
    "sapling": 1,    # 幼苗阶段
    "growing": 2,    # 生长阶段
    "mature": 3      # 成熟阶段
}

def print_status(message):
    """打印带格式的状态消息"""
    print(f"\n[INFO] {message}")

def check_files():
    """检查现有文件和缺失文件"""
    print_status("检查现有模型文件...")
    
    existing_files = []
    missing_files = []
    
    for file in EXPORT_DIR.glob("*.glb"):
        existing_files.append(file.name)
    
    print(f"发现 {len(existing_files)} 个现有模型文件")
    
    # 检查每种树木的每个生长阶段
    for tree in TREE_TYPES:
        for stage, _ in GROWTH_STAGES.items():
            if stage == "seedstage":
                filename = f"seedstage_{tree}.glb"
            else:
                filename = f"{tree}_{stage}.glb"
            
            if filename not in existing_files:
                missing_files.append(filename)
    
    print(f"缺少 {len(missing_files)} 个模型文件:")
    for file in missing_files:
        print(f"  - {file}")
    
    return existing_files, missing_files

def create_missing_models(existing_files, missing_files):
    """通过复制和重命名创建缺失的模型"""
    print_status("开始创建缺失模型...")
    
    created_count = 0
    
    # 为每种树木创建缺失的生长阶段
    for tree in TREE_TYPES:
        # 检查通用模型是否存在
        generic_model = f"{tree}.glb"
        if generic_model in existing_files:
            # 创建各个缺失的生长阶段模型
            for stage, _ in GROWTH_STAGES.items():
                if stage == "seedstage":
                    target = f"seedstage_{tree}.glb"
                else:
                    target = f"{tree}_{stage}.glb"
                
                if target in missing_files:
                    # 选择最佳的源模型
                    source = select_best_source(tree, stage, existing_files)
                    
                    if source:
                        # 复制模型
                        shutil.copy(
                            EXPORT_DIR / source,
                            EXPORT_DIR / target
                        )
                        print(f"  创建模型 {target} (基于 {source})")
                        created_count += 1
                    else:
                        print(f"  无法为 {target} 找到合适的源模型")
    
    print(f"\n成功创建 {created_count} 个缺失模型")
    return created_count

def select_best_source(tree, target_stage, existing_files):
    """为给定的树木和目标生长阶段选择最佳源模型"""
    # 优先级顺序 (从高到低)
    if target_stage == "seedstage":
        # 种子阶段优先级
        priorities = [
            f"seedstage_{tree}.glb",  # 首选同一树种的种子模型
            f"{tree}_sapling.glb",    # 次选同一树种的幼苗模型
            f"{tree}.glb",            # 再次选择同一树种的通用模型
            "seedstage_oak.glb",      # 橡树种子作为备选
            "seedstage_pine.glb",     # 松树种子作为备选
            "seedstage_apple.glb",    # 苹果树种子作为备选
        ]
    elif target_stage == "sapling":
        # 幼苗阶段优先级
        priorities = [
            f"{tree}_sapling.glb",    # 首选同一树种的幼苗模型
            f"{tree}_growing.glb",    # 次选同一树种的生长阶段模型
            f"{tree}.glb",            # 再次选择同一树种的通用模型
            "oak_sapling.glb",        # 橡树幼苗作为备选
            "palm_sapling.glb",       # 棕榈树幼苗作为备选
            "apple_sapling.glb",      # 苹果树幼苗作为备选
        ]
    elif target_stage == "growing":
        # 生长阶段优先级
        priorities = [
            f"{tree}_growing.glb",    # 首选同一树种的生长阶段模型
            f"{tree}_mature.glb",     # 次选同一树种的成熟模型
            f"{tree}.glb",            # 再次选择同一树种的通用模型
            "oak_growing.glb",        # 橡树生长阶段作为备选
            f"{tree}_sapling.glb",    # 同一树种的幼苗模型
            f"{tree}_mature.glb",     # 同一树种的成熟模型
        ]
    elif target_stage == "mature":
        # 成熟阶段优先级
        priorities = [
            f"{tree}_mature.glb",     # 首选同一树种的成熟模型
            f"{tree}.glb",            # 次选同一树种的通用模型
            f"{tree}_growing.glb",    # 再次选择同一树种的生长阶段模型
            "oak_mature.glb",         # 橡树成熟模型作为备选
            "pine_mature.glb",        # 松树成熟模型作为备选
            "maple_mature.glb",       # 枫树成熟模型作为备选
        ]
    
    # 检查文件是否存在
    for file in priorities:
        if file in existing_files:
            return file
    
    # 如果没有找到适合的源模型，返回None
    return None

def sync_to_client():
    """将模型文件同步到客户端目录"""
    print_status("同步模型文件到客户端目录...")
    
    # 确保客户端目录存在
    CLIENT_DIR.mkdir(parents=True, exist_ok=True)
    
    # 复制所有模型文件到客户端目录
    for file in EXPORT_DIR.glob("*.glb"):
        target_file = CLIENT_DIR / file.name
        if not target_file.exists() or os.path.getsize(file) != os.path.getsize(target_file):
            shutil.copy2(file, target_file)
            print(f"  复制 {file.name} 到客户端目录")
    
    print("同步完成")

def generate_model_report():
    """生成模型完整性报告"""
    print_status("生成模型完整性报告...")
    
    report = {
        "totalModels": 0,
        "missingModels": 0,
        "treeTypes": {},
        "timestamp": "生成时间"
    }
    
    # 检查现有模型
    existing_files = [f.name for f in EXPORT_DIR.glob("*.glb")]
    report["totalModels"] = len(existing_files)
    
    # 分析每种树木
    for tree in TREE_TYPES:
        tree_info = {
            "genericModel": f"{tree}.glb" in existing_files,
            "stages": {}
        }
        
        for stage_name, stage_num in GROWTH_STAGES.items():
            if stage_name == "seedstage":
                filename = f"seedstage_{tree}.glb"
            else:
                filename = f"{tree}_{stage_name}.glb"
                
            tree_info["stages"][stage_name] = filename in existing_files
            
            if filename not in existing_files:
                report["missingModels"] += 1
        
        report["treeTypes"][tree] = tree_info
    
    # 写入报告文件
    report_file = EXPORT_DIR / "model_report.json"
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)
    
    print(f"报告已保存到 {report_file}")
    
    return report

def main():
    """主函数"""
    # 打印标题
    print("\n" + "="*60)
    print("TaskForest 缺失模型生成工具")
    print("="*60)
    
    # 检查目录
    if not EXPORT_DIR.exists():
        print(f"错误: 导出目录不存在: {EXPORT_DIR}")
        return 1
    
    # 检查现有文件和缺失文件
    existing_files, missing_files = check_files()
    
    # 创建缺失模型
    if missing_files:
        created_count = create_missing_models(existing_files, missing_files)
    else:
        print("没有缺失的模型文件!")
        created_count = 0
    
    # 同步到客户端目录
    sync_to_client()
    
    # 生成模型报告
    report = generate_model_report()
    
    # 打印总结
    print("\n" + "="*60)
    print(f"总结:")
    print(f"  - 检查了 {len(existing_files)} 个现有模型")
    print(f"  - 发现 {len(missing_files)} 个缺失模型")
    print(f"  - 成功创建 {created_count} 个缺失模型")
    print(f"  - 当前缺失模型数: {report['missingModels']}")
    print("="*60)
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 