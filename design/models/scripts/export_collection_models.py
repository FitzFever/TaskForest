#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TaskForest树木合集模型导出脚本
此脚本专门用于从树木合集模型文件(tree_models_2024_04_10.blend)中导出各个树种、各个阶段的模型

使用方法:
blender -b tree_models_2024_04_10.blend -P export_collection_models.py -- --output-dir ../export/trees

参数说明与export_gltf.py相同
"""

import os
import sys
import bpy
import argparse

# 树木类型列表
TREE_TYPES = ["oak", "pine", "cherry", "apple", "maple", "willow", "palm"]

# 生长阶段列表
GROWTH_STAGES = ["seed", "sapling", "growing", "mature"]

# 导出命名规范
NAMING_CONVENTION = {
    "seed": "seedstage_{}",
    "sapling": "{}_sapling",
    "growing": "{}_growing",
    "mature": "{}_mature"
}

def parse_arguments():
    """解析命令行参数"""
    # 获取传递给脚本的参数
    argv = sys.argv
    
    if "--" not in argv:
        # 如果是在Blender内部运行脚本，使用默认参数
        return {
            "output_dir": "../export/trees",
            "format": "glb",
            "export_animations": True,
            "export_textures": True,
            "scale": 1.0
        }
    
    # 解析命令行参数
    parser = argparse.ArgumentParser(description="从合集文件导出树木模型")
    parser.add_argument("--output-dir", dest="output_dir", type=str, default="../export/trees", 
                      help="输出目录")
    parser.add_argument("--format", dest="format", type=str, default="glb", 
                      choices=["glb", "gltf"], help="输出格式: glb 或 gltf")
    parser.add_argument("--export-animations", dest="export_animations", type=str, default="yes", 
                      choices=["yes", "no"], help="是否导出动画")
    parser.add_argument("--export-textures", dest="export_textures", type=str, default="yes", 
                      choices=["yes", "no"], help="是否导出纹理")
    parser.add_argument("--scale", dest="scale", type=float, default=1.0, 
                      help="缩放比例")
    
    # 只解析脚本参数，忽略blender参数
    args = parser.parse_args(argv[argv.index("--") + 1:])
    
    # 转换字符串参数为布尔值
    export_animations = args.export_animations.lower() == "yes"
    export_textures = args.export_textures.lower() == "yes"
    
    return {
        "output_dir": args.output_dir,
        "format": args.format,
        "export_animations": export_animations,
        "export_textures": export_textures,
        "scale": args.scale
    }

def get_objects_by_name_pattern(pattern):
    """获取名称匹配指定模式的对象列表"""
    return [obj for obj in bpy.data.objects if pattern.lower() in obj.name.lower()]

def export_model_by_pattern(args, pattern, output_name):
    """导出指定模式的对象为单独模型"""
    # 获取匹配模式的对象
    matching_objects = get_objects_by_name_pattern(pattern)
    
    if not matching_objects:
        print(f"警告: 没有找到匹配 '{pattern}' 的对象")
        return False
    
    # 取消选择所有对象
    bpy.ops.object.select_all(action='DESELECT')
    
    # 选择匹配的对象
    for obj in matching_objects:
        obj.select_set(True)
        print(f"已选择对象: {obj.name}")
    
    # 确保输出目录存在
    os.makedirs(args["output_dir"], exist_ok=True)
    
    # 设置输出文件名
    output_file = output_name
    if not output_file.endswith("." + args["format"]):
        output_file += "." + args["format"]
    
    # 构建完整输出路径
    output_path = os.path.join(args["output_dir"], output_file)
    
    print(f"正在导出 '{pattern}' 模型到: {output_path}")
    
    # 导出选项
    export_options = {
        'export_format': args["format"].upper(),
        'export_animations': args["export_animations"],
        'export_materials': True,
        'export_colors': True,
        'use_selection': True,
        'export_extras': True,
        'export_yup': True,
        'export_texcoords': True
    }
    
    # 导出为GLB/GLTF
    bpy.ops.export_scene.gltf(filepath=output_path, **export_options)
    
    print(f"导出完成: {output_path}")
    return True

def main():
    """主函数"""
    args = parse_arguments()
    
    print("\n=== TaskForest 树木合集模型导出脚本 ===")
    print(f"输出目录: {args['output_dir']}")
    print(f"输出格式: {args['format']}")
    
    # 确保我们在对象模式
    if bpy.context.active_object and bpy.context.active_object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    
    # 导出结果跟踪
    successful_exports = []
    failed_exports = []
    
    # 遍历所有树木类型和生长阶段，尝试导出模型
    for tree_type in TREE_TYPES:
        for stage in GROWTH_STAGES:
            # 构建搜索模式和输出文件名
            search_pattern = f"{tree_type}_{stage}"
            output_name = NAMING_CONVENTION[stage].format(tree_type)
            
            # 尝试导出模型
            result = export_model_by_pattern(args, search_pattern, output_name)
            
            if result:
                successful_exports.append(f"{tree_type} - {stage} ({output_name})")
            else:
                failed_exports.append(f"{tree_type} - {stage} ({output_name})")
    
    # 打印导出结果统计
    print("\n=== 导出结果统计 ===")
    print(f"成功导出: {len(successful_exports)}")
    for item in successful_exports:
        print(f"  ✅ {item}")
    
    print(f"\n导出失败: {len(failed_exports)}")
    for item in failed_exports:
        print(f"  ❌ {item}")

if __name__ == "__main__":
    main() 