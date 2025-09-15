#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TaskForest 3D模型导出脚本
用于从Blender文件批量导出GLB/GLTF格式的模型

使用方法：
1. 命令行方式：
   blender -b 源文件.blend -P export_gltf.py -- [参数]

2. Blender内部使用:
   在Blender中打开文本编辑器，加载此脚本并运行

参数:
  --output-dir: 输出目录
  --format: 输出格式，可选 'glb' 或 'gltf'（默认为'glb'）
  --export-animations: 是否导出动画，可选 'yes' 或 'no'（默认为'yes'）
  --export-textures: 是否导出纹理，可选 'yes' 或 'no'（默认为'yes'）
  --scale: 缩放比例（默认为1.0）
  --all-objects: 导出所有对象，不仅仅是选中的（默认为'yes'）
  --target-file: 指定输出文件名（默认使用Blender文件名）

示例:
  blender -b oak_seed.blend -P export_gltf.py -- --output-dir ../export/trees
"""

import os
import sys
import bpy
import math
import argparse

def parse_arguments():
    """解析命令行参数"""
    # 获取传递给脚本的参数
    argv = sys.argv
    
    if "--" not in argv:
        # 如果是在Blender内部运行脚本，使用默认参数
        return {
            "output_dir": "./export",
            "format": "glb",
            "export_animations": True,
            "export_textures": True,
            "scale": 1.0,
            "all_objects": True,
            "target_file": None
        }
    
    # 解析命令行参数
    parser = argparse.ArgumentParser(description="导出Blender模型为GLB/GLTF格式")
    parser.add_argument("--output-dir", dest="output_dir", type=str, default="./export", 
                      help="输出目录")
    parser.add_argument("--format", dest="format", type=str, default="glb", 
                      choices=["glb", "gltf"], help="输出格式: glb 或 gltf")
    parser.add_argument("--export-animations", dest="export_animations", type=str, default="yes", 
                      choices=["yes", "no"], help="是否导出动画")
    parser.add_argument("--export-textures", dest="export_textures", type=str, default="yes", 
                      choices=["yes", "no"], help="是否导出纹理")
    parser.add_argument("--scale", dest="scale", type=float, default=1.0, 
                      help="缩放比例")
    parser.add_argument("--all-objects", dest="all_objects", type=str, default="yes", 
                      choices=["yes", "no"], help="是否导出所有对象")
    parser.add_argument("--target-file", dest="target_file", type=str, default=None, 
                      help="指定输出文件名")
    
    # 只解析脚本参数，忽略blender参数
    args = parser.parse_args(argv[argv.index("--") + 1:])
    
    # 转换字符串参数为布尔值
    export_animations = args.export_animations.lower() == "yes"
    export_textures = args.export_textures.lower() == "yes"
    all_objects = args.all_objects.lower() == "yes"
    
    return {
        "output_dir": args.output_dir,
        "format": args.format,
        "export_animations": export_animations,
        "export_textures": export_textures,
        "scale": args.scale,
        "all_objects": all_objects,
        "target_file": args.target_file
    }

def prepare_scene(scale):
    """准备场景用于导出"""
    print("正在准备场景...")
    
    # 切换到对象模式
    if bpy.context.active_object and bpy.context.active_object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    
    # 如果需要缩放
    if scale != 1.0:
        print(f"应用缩放: {scale}")
        for obj in bpy.context.scene.objects:
            if obj.type == 'MESH' or obj.type == 'ARMATURE':
                obj.scale = (scale, scale, scale)
    
    # 确保应用所有变换
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            # 选择对象
            bpy.ops.object.select_all(action='DESELECT')
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
            
            # 应用变换
            bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    
    # 重置所有选择
    bpy.ops.object.select_all(action='DESELECT')

def setup_export_options(args):
    """设置导出选项"""
    # 构建基本选项
    options = {
        'export_format': args["format"].upper(),
        'export_animations': args["export_animations"],
        'export_materials': True,
        'export_colors': True,
        'export_skins': True,
        'export_cameras': True,
        'export_extras': True,
        'export_yup': True,  # Y轴向上
        'use_selection': not args["all_objects"],
        'export_texture_dir': "",
        'export_keep_originals': True,
        'export_texcoords': True,
        'export_lights': True
    }
    
    return options

def export_model(args, options):
    """导出模型"""
    # 获取Blender文件名
    blend_file = bpy.data.filepath
    blend_file_name = os.path.splitext(os.path.basename(blend_file))[0]
    
    # 设置输出文件名
    if args["target_file"]:
        output_file = args["target_file"]
    else:
        output_file = blend_file_name
    
    # 添加扩展名
    if not output_file.endswith("." + args["format"]):
        output_file += "." + args["format"]
    
    # 确保输出目录存在
    os.makedirs(args["output_dir"], exist_ok=True)
    
    # 构建完整输出路径
    output_path = os.path.join(args["output_dir"], output_file)
    
    print(f"正在导出模型到: {output_path}")
    
    # 导出为GLB/GLTF
    bpy.ops.export_scene.gltf(filepath=output_path, **options)
    
    print(f"模型导出完成!")
    return output_path

def generate_previews(output_path):
    """生成预览图像"""
    try:
        # 设置渲染参数
        bpy.context.scene.render.engine = 'CYCLES'
        bpy.context.scene.render.film_transparent = True
        bpy.context.scene.render.resolution_x = 512
        bpy.context.scene.render.resolution_y = 512
        bpy.context.scene.render.resolution_percentage = 100
        
        # 设置相机
        camera_data = bpy.data.cameras.new(name='PreviewCamera')
        camera_obj = bpy.data.objects.new('PreviewCamera', camera_data)
        bpy.context.scene.collection.objects.link(camera_obj)
        bpy.context.scene.camera = camera_obj
        
        # 计算模型边界框
        bound_box = None
        for obj in bpy.context.scene.objects:
            if obj.type == 'MESH':
                if bound_box is None:
                    bound_box = obj.bound_box[:]
                else:
                    for i in range(8):
                        for j in range(3):
                            bound_box[i][j] = max(bound_box[i][j], obj.bound_box[i][j])
        
        # 设置相机位置
        if bound_box:
            # 计算包围盒中心和尺寸
            min_x = min(v[0] for v in bound_box)
            max_x = max(v[0] for v in bound_box)
            min_y = min(v[1] for v in bound_box)
            max_y = max(v[1] for v in bound_box)
            min_z = min(v[2] for v in bound_box)
            max_z = max(v[2] for v in bound_box)
            
            center_x = (min_x + max_x) / 2
            center_y = (min_y + max_y) / 2
            center_z = (min_z + max_z) / 2
            
            size = max(max_x - min_x, max_y - min_y, max_z - min_z)
            camera_distance = size * 2.5
            
            # 设置相机位置为透视角度
            camera_obj.location = (
                center_x + camera_distance * math.cos(math.radians(45)) * math.cos(math.radians(30)),
                center_y + camera_distance * math.sin(math.radians(45)) * math.cos(math.radians(30)),
                center_z + camera_distance * math.sin(math.radians(30))
            )
            
            # 相机看向中心
            direction = (center_x - camera_obj.location.x,
                         center_y - camera_obj.location.y,
                         center_z - camera_obj.location.z)
            
            # 计算旋转
            rot_quat = direction.to_track_quat('-Z', 'Y')
            camera_obj.rotation_euler = rot_quat.to_euler()
        else:
            # 默认相机位置
            camera_obj.location = (5, 5, 5)
            camera_obj.rotation_euler = (0.785398, 0, 0.785398)  # 45度角
        
        # 生成预览图像
        preview_path = os.path.splitext(output_path)[0] + "_preview.png"
        bpy.context.scene.render.filepath = preview_path
        bpy.ops.render.render(write_still=True)
        
        print(f"预览图像已保存到: {preview_path}")
    except Exception as e:
        print(f"生成预览图像时出错: {e}")

def main():
    """主函数"""
    # 解析参数
    args = parse_arguments()
    
    print("\n=== TaskForest 3D模型导出脚本 ===")
    print(f"输出目录: {args['output_dir']}")
    print(f"输出格式: {args['format']}")
    print(f"导出动画: {args['export_animations']}")
    print(f"导出纹理: {args['export_textures']}")
    print(f"缩放比例: {args['scale']}")
    print(f"导出所有对象: {args['all_objects']}")
    if args['target_file']:
        print(f"输出文件名: {args['target_file']}")
    print("===================================\n")
    
    # 准备场景
    prepare_scene(args["scale"])
    
    # 设置导出选项
    export_options = setup_export_options(args)
    
    # 导出模型
    output_path = export_model(args, export_options)
    
    # 可选: 生成预览图像
    generate_previews(output_path)
    
    print("导出完成!")

if __name__ == "__main__":
    main() 