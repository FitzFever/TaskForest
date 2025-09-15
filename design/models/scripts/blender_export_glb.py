
import bpy
import sys
import os

# 获取命令行参数
argv = sys.argv
argv = argv[argv.index("--") + 1:] if "--" in argv else []

if len(argv) < 1:
    print("错误: 缺少输出文件路径")
    sys.exit(1)

output_file = argv[0]
print(f"导出到: {output_file}")

# 导出设置
bpy.ops.export_scene.gltf(
    filepath=output_file,
    export_format='GLB',
    export_texcoords=True,
    export_normals=True,
    export_tangents=True,
    export_materials=True,
    export_colors=True,
    export_animations=True,
    export_yup=True,
    export_apply=True,
    export_lights=True
)

print(f"已成功导出模型: {output_file}")
