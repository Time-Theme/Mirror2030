#!/bin/bash

################################################################################
# 镜像源速度测试脚本
# 用途：在Linux服务器上快速测试各大镜像源的连接速度
# 使用：curl -sSL your-domain.com/speed-test.sh | bash
################################################################################

echo "======================================================"
echo "  镜像源速度测试工具"
echo "======================================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 镜像源列表
declare -A MIRRORS=(
    ["阿里云"]="mirrors.aliyun.com"
    ["腾讯云"]="mirrors.cloud.tencent.com"
    ["清华大学"]="mirrors.tuna.tsinghua.edu.cn"
    ["华为云"]="mirrors.huaweicloud.com"
    ["中科大"]="mirrors.ustc.edu.cn"
    ["网易"]="mirrors.163.com"
)

# 测试单个镜像源
test_mirror() {
    local name=$1
    local url=$2

    echo -n "测试 $name ... "

    # 使用curl测试连接时间（毫秒）
    local time=$(curl -o /dev/null -s -w '%{time_total}\n' --connect-timeout 3 "http://$url" 2>/dev/null)

    if [ -z "$time" ] || [ "$time" == "0.000" ]; then
        echo -e "${RED}超时${NC}"
        echo "999999 $name"  # 返回一个很大的数字用于排序
    else
        # 转换为毫秒
        local ms=$(echo "$time * 1000" | bc | cut -d'.' -f1)

        # 根据速度显示不同颜色
        if [ "$ms" -lt 100 ]; then
            echo -e "${GREEN}${ms}ms ⚡ 极快${NC}"
        elif [ "$ms" -lt 300 ]; then
            echo -e "${GREEN}${ms}ms ✓ 快速${NC}"
        elif [ "$ms" -lt 1000 ]; then
            echo -e "${YELLOW}${ms}ms - 一般${NC}"
        else
            echo -e "${RED}${ms}ms × 较慢${NC}"
        fi

        echo "$ms $name"
    fi
}

echo "开始测试，请稍候..."
echo ""

# 存储测试结果
results_file=$(mktemp)

# 测试所有镜像源
for mirror_name in "${!MIRRORS[@]}"; do
    mirror_url="${MIRRORS[$mirror_name]}"
    test_mirror "$mirror_name" "$mirror_url" >> "$results_file"
done

echo ""
echo "======================================================"
echo "  测试结果（按速度排序）"
echo "======================================================"

# 排序并显示结果
sort -n "$results_file" | while read -r ms name; do
    if [ "$ms" == "999999" ]; then
        echo -e "${RED}✗${NC} $name - 无法连接"
    elif [ "$ms" -lt 100 ]; then
        echo -e "${GREEN}⚡${NC} $name - ${ms}ms （推荐）"
    elif [ "$ms" -lt 300 ]; then
        echo -e "${GREEN}✓${NC} $name - ${ms}ms"
    elif [ "$ms" -lt 1000 ]; then
        echo -e "${YELLOW}−${NC} $name - ${ms}ms"
    else
        echo -e "${RED}×${NC} $name - ${ms}ms"
    fi
done

# 获取最快的镜像源
fastest=$(sort -n "$results_file" | head -n 1)
fastest_ms=$(echo $fastest | cut -d' ' -f1)
fastest_name=$(echo $fastest | cut -d' ' -f2-)

if [ "$fastest_ms" != "999999" ]; then
    echo ""
    echo "======================================================"
    echo -e "  🏆 推荐使用：${GREEN}${fastest_name}${NC} (${fastest_ms}ms)"
    echo "======================================================"
fi

# 清理临时文件
rm -f "$results_file"

echo ""
echo "💡 提示：访问 https://your-domain.com 一键配置镜像源"
echo ""
