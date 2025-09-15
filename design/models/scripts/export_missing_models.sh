#!/bin/bash

# TaskForest 3D模型批量导出脚本
# 此脚本用于导出所有缺失的树木生长阶段模型

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$SCRIPT_DIR/../source/trees"
EXPORT_DIR="$SCRIPT_DIR/../export/trees"
EXPORT_SCRIPT="$SCRIPT_DIR/export_gltf.py"

# 确保导出目录存在
mkdir -p "$EXPORT_DIR"

# 导出函数
export_model() {
    local blend_file="$1"
    local output_name="$2"
    
    echo "正在导出: $blend_file -> $output_name"
    blender -b "$blend_file" -P "$EXPORT_SCRIPT" -- --output-dir "$EXPORT_DIR" --target-file "$output_name" --format "glb"
}

# 处理种子阶段模型
echo "=== 导出种子阶段模型 ==="
# 列出所有种子模型并导出
for seed_file in "$SOURCE_DIR"/*_seed.blend; do
    if [ -f "$seed_file" ]; then
        tree_type=$(basename "$seed_file" "_seed.blend")
        export_model "$seed_file" "seedstage_${tree_type}.glb"
    fi
done

# 处理幼苗阶段模型
echo "=== 导出幼苗阶段模型 ==="
# 列出所有幼苗模型并导出
for sapling_file in "$SOURCE_DIR"/*_sapling.blend; do
    if [ -f "$sapling_file" ]; then
        tree_type=$(basename "$sapling_file" "_sapling.blend")
        export_model "$sapling_file" "${tree_type}_sapling.glb"
    fi
done

# 处理生长阶段模型
echo "=== 导出生长阶段模型 ==="
# 列出所有生长阶段模型并导出
for growing_file in "$SOURCE_DIR"/*_growing.blend; do
    if [ -f "$growing_file" ]; then
        tree_type=$(basename "$growing_file" "_growing.blend")
        export_model "$growing_file" "${tree_type}_growing.glb"
    fi
done

# 处理成熟阶段模型
echo "=== 导出成熟阶段模型 ==="
# 列出所有成熟阶段模型并导出
for mature_file in "$SOURCE_DIR"/*_mature.blend; do
    if [ -f "$mature_file" ]; then
        tree_type=$(basename "$mature_file" "_mature.blend")
        export_model "$mature_file" "${tree_type}_mature.glb"
    fi
done

# 对于缺少专门阶段文件的树木，尝试从统一模型导出
echo "=== 导出通用树木模型 ==="
if [ -f "$SOURCE_DIR/tree_models_2024_04_10.blend" ]; then
    # 使用最新的树木模型合集文件导出其他缺失的模型
    # 注意：这需要在Blender文件中有正确命名的对象
    export_model "$SOURCE_DIR/tree_models_2024_04_10.blend" "trees_collection.glb"
fi

echo "=== 模型导出完成 ==="
echo "所有模型已导出到: $EXPORT_DIR"
echo "请检查是否有任何错误消息，并验证导出的文件。" 