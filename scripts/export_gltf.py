#!/usr/bin/env python3
"""
Blender脚本: 将.blend文件导出为glTF/GLB格式
使用方法: blender -b 模型文件.blend -P export_gltf.py -- 输出路径
"""

import bpy
import os
import sys

def export_gltf():
    # 获取命令行参数
    argv = sys.argv
    argv = argv[argv.index("--") + 1:]  # 获取"--"之后的参数
    
    if len(argv) < 1:
        output_dir = os.path.dirname(bpy.data.filepath)
        print(f"未指定输出路径，默认使用当前blend文件所在目录: {output_dir}")
    else:
        output_dir = argv[0]
        
    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)
    
    # 获取当前blend文件名（不含扩展名）
    blend_name = os.path.splitext(os.path.basename(bpy.data.filepath))[0]
    output_file = os.path.join(output_dir, f"{blend_name}.glb")
    
    # 导出为GLB格式（单文件包含所有资源）
    bpy.ops.export_scene.gltf(
        filepath=output_file,
        export_format='GLB',
        use_selection=False,  # 导出所有对象
        export_animations=True,
        export_cameras=True,
        export_lights=True,
        export_materials=True,
        export_normals=True,
        export_texcoords=True,
        export_colors=True
    )
    
    print(f"导出完成: {output_file}")
    
    # 同时导出glTF格式(分离资源文件，适合调试)
    output_file_gltf = os.path.join(output_dir, f"{blend_name}.gltf")
    bpy.ops.export_scene.gltf(
        filepath=output_file_gltf,
        export_format='GLTF_SEPARATE',
        use_selection=False,
        export_animations=True,
        export_cameras=True,
        export_lights=True,
        export_materials=True,
        export_normals=True,
        export_texcoords=True,
        export_colors=True
    )
    
    print(f"导出完成: {output_file_gltf}")

if __name__ == "__main__":
    export_gltf() 