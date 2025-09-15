#!/bin/bash

# TaskForest树木模型全量导出主脚本
# 此脚本用于导出所有树木模型，包括单独的模型文件和合集文件

echo "============================================"
echo "  TaskForest 树木模型导出工具"
echo "============================================"
echo "此脚本将导出所有树木模型到正确的位置，以解决3D模型缺失问题"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODELS_DIR="$SCRIPT_DIR/models"
SOURCE_DIR="$MODELS_DIR/source/trees"
EXPORT_DIR="$MODELS_DIR/export/trees"
SCRIPTS_DIR="$MODELS_DIR/scripts"
CLIENT_DIR="$SCRIPT_DIR/../client/public/models/trees"

# 检查Blender是否安装
command -v blender >/dev/null 2>&1 || { 
    echo "错误: 需要安装Blender才能运行此脚本"; 
    echo "请从https://www.blender.org/download/安装Blender，并确保其可以在命令行中使用"; 
    exit 1; 
}

# 确保导出目录存在
mkdir -p "$EXPORT_DIR"

# 备份现有文件
echo "正在备份现有模型文件..."
BACKUP_DIR="$EXPORT_DIR/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp "$EXPORT_DIR"/*.glb "$BACKUP_DIR"/ 2>/dev/null || echo "没有现有文件需要备份"

# 第1步：导出单独的模型文件
echo ""
echo "=== 第1步：导出单独的模型文件 ==="
bash "$SCRIPTS_DIR/export_missing_models.sh"

# 第2步：从合集文件导出模型
echo ""
echo "=== 第2步：从合集文件导出模型 ==="
if [ -f "$SOURCE_DIR/tree_models_2024_04_10.blend" ]; then
    echo "找到树木合集文件，正在导出..."
    blender -b "$SOURCE_DIR/tree_models_2024_04_10.blend" -P "$SCRIPTS_DIR/export_collection_models.py" -- --output-dir "$EXPORT_DIR"
else
    echo "警告: 未找到树木合集文件 (tree_models_2024_04_10.blend)"
fi

# 第3步：确保客户端目录与导出目录同步
echo ""
echo "=== 第3步：确保客户端目录与导出目录同步 ==="
if [ -d "$CLIENT_DIR" ]; then
    echo "正在同步模型文件到客户端目录..."
    cp -f "$EXPORT_DIR"/*.glb "$CLIENT_DIR"/
    echo "同步完成"
else
    echo "警告: 客户端模型目录不存在，请确保目录 $CLIENT_DIR 存在"
    echo "您可能需要手动将导出的模型文件复制到客户端模型目录"
fi

# 输出导出结果
echo ""
echo "=== 导出结果 ==="
echo "导出目录: $EXPORT_DIR"
echo "导出的模型文件:"
ls -la "$EXPORT_DIR"/*.glb | wc -l
echo ""
echo "如果您看到任何警告或错误，请检查相应的Blender源文件"

# 验证缺少的模型
echo ""
echo "=== 验证缺少的关键模型 ==="
# 树木类型列表
TREE_TYPES=("oak" "pine" "cherry" "apple" "maple" "willow" "palm")
# 生长阶段
MISSING=0

for type in "${TREE_TYPES[@]}"; do
    # 检查生长阶段
    if [ ! -f "$EXPORT_DIR/${type}_growing.glb" ]; then
        echo "警告: 缺少 ${type}_growing.glb 模型"
        MISSING=$((MISSING+1))
    fi
    
    # 检查幼苗阶段
    if [ ! -f "$EXPORT_DIR/${type}_sapling.glb" ]; then
        echo "警告: 缺少 ${type}_sapling.glb 模型"
        MISSING=$((MISSING+1))
    fi
done

if [ $MISSING -eq 0 ]; then
    echo "所有关键模型都已成功导出!"
else
    echo "警告: 仍有 $MISSING 个关键模型未导出，可能需要在Blender中创建这些模型"
fi

echo ""
echo "模型导出过程完成!"
echo "============================================" 