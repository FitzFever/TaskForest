#!/bin/bash

# TaskForest 3D模型批量导出脚本
# 用于批量导出所有树木模型

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # 无颜色

# 设置目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SOURCE_DIR="$SCRIPT_DIR/../source/trees"
EXPORT_DIR="$SCRIPT_DIR/../export/trees"
EXPORT_SCRIPT="$SCRIPT_DIR/export_gltf.py"

# 确保导出目录存在
mkdir -p "$EXPORT_DIR"

echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}     TaskForest 3D模型批量导出脚本     ${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo -e "${BLUE}源文件目录:${NC} $SOURCE_DIR"
echo -e "${BLUE}导出目录:${NC} $EXPORT_DIR"
echo -e "${BLUE}导出脚本:${NC} $EXPORT_SCRIPT"
echo ""

# 检查Blender是否安装
if ! command -v blender &> /dev/null; then
    echo -e "${RED}错误:${NC} 未找到Blender。请确保Blender已安装并添加到系统PATH中。"
    exit 1
fi

# 获取Blender版本
BLENDER_VERSION=$(blender --version | head -n 1 | cut -d ' ' -f 2)
echo -e "${BLUE}检测到Blender版本:${NC} $BLENDER_VERSION"
echo ""

# 记录导出开始时间
START_TIME=$(date +%s)

# 导出函数
export_model() {
    local source_file="$1"
    local target_file="$2"
    local options="$3"
    
    echo -e "${YELLOW}正在导出:${NC} $(basename "$source_file") -> $(basename "$target_file")"
    
    # 执行导出命令
    blender -b "$source_file" -P "$EXPORT_SCRIPT" -- --output-dir "$EXPORT_DIR" --target-file "$(basename "$target_file")" $options
    
    # 检查导出结果
    if [ -f "$EXPORT_DIR/$(basename "$target_file")" ]; then
        echo -e "${GREEN}成功:${NC} 已导出到 $EXPORT_DIR/$(basename "$target_file")"
    else
        echo -e "${RED}失败:${NC} 导出 $source_file 时出错"
    fi
    echo ""
}

# 批量导出所有树种的所有生长阶段
process_tree_type() {
    local tree_type="$1"
    local source_subdir="$SOURCE_DIR/$tree_type"
    
    if [ ! -d "$source_subdir" ]; then
        echo -e "${YELLOW}警告:${NC} 未找到目录 $source_subdir，跳过处理"
        return
    fi
    
    echo -e "${BLUE}处理树种:${NC} $tree_type"
    
    # 导出种子阶段
    local seed_file="$source_subdir/${tree_type}_seed.blend"
    if [ -f "$seed_file" ]; then
        export_model "$seed_file" "${tree_type}_seed.glb" ""
    else
        echo -e "${YELLOW}警告:${NC} 未找到文件 $seed_file"
    fi
    
    # 导出幼苗阶段
    local sapling_file="$source_subdir/${tree_type}_sapling.blend"
    if [ -f "$sapling_file" ]; then
        export_model "$sapling_file" "${tree_type}_sapling.glb" ""
    else
        echo -e "${YELLOW}警告:${NC} 未找到文件 $sapling_file"
    fi
    
    # 导出成长阶段
    local growing_file="$source_subdir/${tree_type}_growing.blend"
    if [ -f "$growing_file" ]; then
        export_model "$growing_file" "${tree_type}_growing.glb" ""
    else
        echo -e "${YELLOW}警告:${NC} 未找到文件 $growing_file"
    fi
    
    # 导出成熟阶段
    local mature_file="$source_subdir/${tree_type}_mature.blend"
    if [ -f "$mature_file" ]; then
        export_model "$mature_file" "${tree_type}.glb" ""
    else
        echo -e "${YELLOW}警告:${NC} 未找到文件 $mature_file"
    fi
    
    # 导出特殊版本（如果存在）
    case "$tree_type" in
        "cherry")
            local blossom_file="$source_subdir/${tree_type}_blossom.blend"
            if [ -f "$blossom_file" ]; then
                export_model "$blossom_file" "${tree_type}_blossom.glb" ""
            fi
            ;;
        "maple")
            local autumn_file="$source_subdir/${tree_type}_autumn.blend"
            if [ -f "$autumn_file" ]; then
                export_model "$autumn_file" "${tree_type}_autumn.glb" ""
            fi
            ;;
        "apple")
            local fruit_file="$source_subdir/${tree_type}_fruit.blend"
            if [ -f "$fruit_file" ]; then
                export_model "$fruit_file" "${tree_type}_fruit.glb" ""
            fi
            ;;
    esac
    
    echo -e "${GREEN}完成处理树种:${NC} $tree_type"
    echo "----------------------------------------"
}

# 批量导出所有树木
export_all_trees() {
    # 常规树木
    process_tree_type "oak"
    process_tree_type "pine"
    process_tree_type "cherry"
    process_tree_type "maple"
    process_tree_type "palm"
    process_tree_type "willow"
    process_tree_type "apple"
    process_tree_type "rubber_tree"
    
    # 稀有树种
    if [ -d "$SOURCE_DIR/rare" ]; then
        for i in {1..3}; do
            local rare_file="$SOURCE_DIR/rare/rare_tree_$i.blend"
            if [ -f "$rare_file" ]; then
                export_model "$rare_file" "rare_tree_$i.glb" ""
            fi
        done
    fi
    
    # 健康状态变体
    local health_states=("healthy" "slightlywilted" "moderatelywilted" "severelywilted")
    for state in "${health_states[@]}"; do
        local state_file="$SOURCE_DIR/health/${state}tree.blend"
        if [ -f "$state_file" ]; then
            export_model "$state_file" "${state}tree.glb" ""
        fi
    done
}

# 导出特定树种（如果指定）
if [ $# -gt 0 ]; then
    for tree_type in "$@"; do
        process_tree_type "$tree_type"
    done
else
    # 默认导出所有树木
    export_all_trees
fi

# 计算总耗时
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}批量导出完成!${NC}"
echo -e "${BLUE}总耗时:${NC} ${MINUTES}分${SECONDS}秒"
echo -e "${BLUE}模型已导出到:${NC} $EXPORT_DIR"
echo -e "${GREEN}==================================================${NC}" 