#!/bin/bash

#==============================================================================
# 镜像加速站 - 一键换源脚本
# Website: https://mirror2030.com
# Description: 交互式镜像源配置工具，支持备份和还原
#==============================================================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 备份目录
BACKUP_DIR="$HOME/.mirror2030_backup"
BACKUP_TIME=$(date +%Y%m%d_%H%M%S)

# Banner
show_banner() {
    clear
    echo -e "${CYAN}"
    cat << "EOF"
    __  __ _                        ___   ___ _____ ___
   |  \/  (_)_ __ _ __ ___  _ __  |__ \ / _ \___ // _ \
   | |\/| | | '__| '__/ _ \| '__|    ) | | | ||_ \| | | |
   | |  | | | |  | | | (_) | |      / /| |_| |__) | |_| |
   |_|  |_|_|_|  |_|  \___/|_|     |_(_)\___/____/ \___/

EOF
    echo -e "${NC}"
    echo -e "${GREEN}    让下载快到飞起 - 开源镜像换源工具${NC}"
    echo -e "${PURPLE}    Website: https://mirror2030.com${NC}"
    echo ""
}

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为root用户（某些操作需要）
check_root() {
    if [ "$EUID" -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

# 创建备份目录
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log_success "创建备份目录: $BACKUP_DIR"
    fi
}

# 检测操作系统
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
    elif [ -f /etc/lsb-release ]; then
        . /etc/lsb-release
        OS=$DISTRIB_ID
        VER=$DISTRIB_RELEASE
    else
        OS=$(uname -s)
        VER=$(uname -r)
    fi

    log_info "检测到系统: $OS $VER"
}

# 检测已安装的工具
detect_tools() {
    AVAILABLE_TOOLS=()

    command -v npm >/dev/null 2>&1 && AVAILABLE_TOOLS+=("NPM")
    command -v pip >/dev/null 2>&1 && AVAILABLE_TOOLS+=("PIP")
    command -v pip3 >/dev/null 2>&1 && AVAILABLE_TOOLS+=("PIP3")
    command -v docker >/dev/null 2>&1 && AVAILABLE_TOOLS+=("Docker")
    command -v apt >/dev/null 2>&1 && AVAILABLE_TOOLS+=("APT")
    command -v yum >/dev/null 2>&1 && AVAILABLE_TOOLS+=("YUM")
    command -v mvn >/dev/null 2>&1 && AVAILABLE_TOOLS+=("Maven")
    command -v go >/dev/null 2>&1 && AVAILABLE_TOOLS+=("Go")
    command -v composer >/dev/null 2>&1 && AVAILABLE_TOOLS+=("Composer")
    command -v cargo >/dev/null 2>&1 && AVAILABLE_TOOLS+=("Cargo")
    command -v yarn >/dev/null 2>&1 && AVAILABLE_TOOLS+=("Yarn")
    command -v pnpm >/dev/null 2>&1 && AVAILABLE_TOOLS+=("PNPM")
    command -v gem >/dev/null 2>&1 && AVAILABLE_TOOLS+=("RubyGems")
    command -v conda >/dev/null 2>&1 && AVAILABLE_TOOLS+=("Conda")
    command -v brew >/dev/null 2>&1 && AVAILABLE_TOOLS+=("Homebrew")

    if [ ${#AVAILABLE_TOOLS[@]} -eq 0 ]; then
        log_warning "未检测到任何支持的工具"
        return 1
    fi

    log_success "检测到 ${#AVAILABLE_TOOLS[@]} 个工具: ${AVAILABLE_TOOLS[*]}"
    return 0
}

# 选择镜像源
select_mirror() {
    echo ""
    echo -e "${CYAN}=== 选择镜像源 ===${NC}"
    echo "1) 阿里云 (推荐，速度快)"
    echo "2) 腾讯云 (稳定可靠)"
    echo "3) 清华大学 (教育网优选)"
    echo "4) 华为云"
    echo "0) 返回主菜单"
    echo ""
    read -p "请选择镜像源 [1-4]: " mirror_choice

    case $mirror_choice in
        1) MIRROR="aliyun"; MIRROR_NAME="阿里云" ;;
        2) MIRROR="tencent"; MIRROR_NAME="腾讯云" ;;
        3) MIRROR="tsinghua"; MIRROR_NAME="清华大学" ;;
        4) MIRROR="huawei"; MIRROR_NAME="华为云" ;;
        0) return 1 ;;
        *) log_error "无效选择"; return 1 ;;
    esac

    log_success "已选择: $MIRROR_NAME"
    return 0
}

# 备份 NPM 配置
backup_npm() {
    if command -v npm >/dev/null 2>&1; then
        local backup_file="$BACKUP_DIR/npmrc_$BACKUP_TIME"
        npm config get registry > "$backup_file"
        log_success "NPM 配置已备份: $backup_file"
    fi
}

# 配置 NPM
configure_npm() {
    if ! command -v npm >/dev/null 2>&1; then
        return 1
    fi

    backup_npm

    local registry=""
    case $MIRROR in
        aliyun) registry="https://registry.npmmirror.com" ;;
        tencent) registry="https://mirrors.cloud.tencent.com/npm/" ;;
        tsinghua) registry="https://mirrors.tuna.tsinghua.edu.cn/npm/" ;;
        huawei) registry="https://mirrors.huaweicloud.com/repository/npm/" ;;
    esac

    npm config set registry "$registry"
    log_success "NPM 已配置为 $MIRROR_NAME"
}

# 备份 PIP 配置
backup_pip() {
    if command -v pip >/dev/null 2>&1; then
        local backup_file="$BACKUP_DIR/pip_config_$BACKUP_TIME"
        pip config list > "$backup_file" 2>/dev/null || echo "No config" > "$backup_file"
        log_success "PIP 配置已备份: $backup_file"
    fi
}

# 配置 PIP
configure_pip() {
    if ! command -v pip >/dev/null 2>&1; then
        return 1
    fi

    backup_pip

    local index_url=""
    case $MIRROR in
        aliyun) index_url="https://mirrors.aliyun.com/pypi/simple/" ;;
        tencent) index_url="https://mirrors.cloud.tencent.com/pypi/simple/" ;;
        tsinghua) index_url="https://pypi.tuna.tsinghua.edu.cn/simple" ;;
        huawei) index_url="https://mirrors.huaweicloud.com/repository/pypi/simple/" ;;
    esac

    pip config set global.index-url "$index_url"
    log_success "PIP 已配置为 $MIRROR_NAME"
}

# 配置 PIP3
configure_pip3() {
    if ! command -v pip3 >/dev/null 2>&1; then
        return 1
    fi

    local index_url=""
    case $MIRROR in
        aliyun) index_url="https://mirrors.aliyun.com/pypi/simple/" ;;
        tencent) index_url="https://mirrors.cloud.tencent.com/pypi/simple/" ;;
        tsinghua) index_url="https://pypi.tuna.tsinghua.edu.cn/simple" ;;
        huawei) index_url="https://mirrors.huaweicloud.com/repository/pypi/simple/" ;;
    esac

    pip3 config set global.index-url "$index_url"
    log_success "PIP3 已配置为 $MIRROR_NAME"
}

# 备份 Docker 配置
backup_docker() {
    if [ -f /etc/docker/daemon.json ]; then
        local backup_file="$BACKUP_DIR/docker_daemon_$BACKUP_TIME.json"
        sudo cp /etc/docker/daemon.json "$backup_file"
        log_success "Docker 配置已备份: $backup_file"
    fi
}

# 配置 Docker
configure_docker() {
    if ! command -v docker >/dev/null 2>&1; then
        return 1
    fi

    backup_docker

    local mirror_url=""
    case $MIRROR in
        aliyun) mirror_url="https://registry.cn-hangzhou.aliyuncs.com" ;;
        tencent) mirror_url="https://mirror.ccs.tencentyun.com" ;;
        tsinghua) mirror_url="https://docker.mirrors.ustc.edu.cn" ;;
        huawei) mirror_url="https://mirrors.huaweicloud.com" ;;
    esac

    log_warning "配置 Docker 需要 root 权限"
    sudo mkdir -p /etc/docker
    sudo tee /etc/docker/daemon.json > /dev/null << EOF
{
  "registry-mirrors": ["$mirror_url"]
}
EOF

    sudo systemctl daemon-reload 2>/dev/null
    sudo systemctl restart docker 2>/dev/null
    log_success "Docker 已配置为 $MIRROR_NAME"
}

# 备份 APT 配置
backup_apt() {
    if [ -f /etc/apt/sources.list ]; then
        local backup_file="$BACKUP_DIR/sources.list_$BACKUP_TIME"
        sudo cp /etc/apt/sources.list "$backup_file"
        log_success "APT 配置已备份: $backup_file"
    fi
}

# 配置 APT
configure_apt() {
    if ! command -v apt >/dev/null 2>&1; then
        return 1
    fi

    backup_apt

    log_warning "APT 配置需要知道具体的系统版本"
    log_info "请访问 https://mirror2030.com 选择对应系统版本的脚本"
    log_info "或手动执行: curl -sSL https://mirror2030.com/scripts/apt-ubuntu2204-aliyun.sh | bash"
}

# 配置 Yarn
configure_yarn() {
    if ! command -v yarn >/dev/null 2>&1; then
        return 1
    fi

    local registry=""
    case $MIRROR in
        aliyun) registry="https://registry.npmmirror.com" ;;
        tencent) registry="https://mirrors.cloud.tencent.com/npm/" ;;
        tsinghua) registry="https://mirrors.tuna.tsinghua.edu.cn/npm/" ;;
        huawei) registry="https://mirrors.huaweicloud.com/repository/npm/" ;;
    esac

    yarn config set registry "$registry"
    log_success "Yarn 已配置为 $MIRROR_NAME"
}

# 配置 PNPM
configure_pnpm() {
    if ! command -v pnpm >/dev/null 2>&1; then
        return 1
    fi

    local registry=""
    case $MIRROR in
        aliyun) registry="https://registry.npmmirror.com" ;;
        tencent) registry="https://mirrors.cloud.tencent.com/npm/" ;;
        tsinghua) registry="https://mirrors.tuna.tsinghua.edu.cn/npm/" ;;
        huawei) registry="https://mirrors.huaweicloud.com/repository/npm/" ;;
    esac

    pnpm config set registry "$registry"
    log_success "PNPM 已配置为 $MIRROR_NAME"
}

# 配置 Go
configure_go() {
    if ! command -v go >/dev/null 2>&1; then
        return 1
    fi

    local proxy=""
    case $MIRROR in
        aliyun) proxy="https://mirrors.aliyun.com/goproxy/" ;;
        tencent) proxy="https://mirrors.cloud.tencent.com/go/" ;;
        tsinghua) proxy="https://goproxy.cn,direct" ;;
        huawei) proxy="https://goproxy.cn,direct" ;;
    esac

    go env -w GOPROXY="$proxy"
    log_success "Go 已配置为 $MIRROR_NAME"
}

# 配置 Maven
configure_maven() {
    if ! command -v mvn >/dev/null 2>&1; then
        return 1
    fi

    log_info "Maven 配置需要修改 ~/.m2/settings.xml"
    log_info "请访问 https://mirror2030.com/tools/maven/ 获取配置"
}

# 配置 Composer
configure_composer() {
    if ! command -v composer >/dev/null 2>&1; then
        return 1
    fi

    local repo=""
    case $MIRROR in
        aliyun) repo="https://mirrors.aliyun.com/composer/" ;;
        tencent) repo="https://mirrors.cloud.tencent.com/composer/" ;;
        tsinghua) repo="https://mirrors.aliyun.com/composer/" ;;
        huawei) repo="https://mirrors.huaweicloud.com/repository/php/" ;;
    esac

    composer config -g repo.packagist composer "$repo"
    log_success "Composer 已配置为 $MIRROR_NAME"
}

# 一键全局换源
global_configure() {
    show_banner
    echo -e "${CYAN}=== 一键全局换源 ===${NC}"
    echo ""

    if ! detect_tools; then
        read -p "按回车键返回..."
        return
    fi

    if ! select_mirror; then
        return
    fi

    echo ""
    log_info "开始配置，所有更改前会自动备份..."
    create_backup_dir
    sleep 1

    local success_count=0
    local total_count=${#AVAILABLE_TOOLS[@]}

    for tool in "${AVAILABLE_TOOLS[@]}"; do
        echo ""
        log_info "配置 $tool..."
        case $tool in
            "NPM") configure_npm && ((success_count++)) ;;
            "PIP") configure_pip && ((success_count++)) ;;
            "PIP3") configure_pip3 && ((success_count++)) ;;
            "Docker") configure_docker && ((success_count++)) ;;
            "APT") configure_apt ;;
            "YUM") log_info "YUM 配置请访问 https://mirror2030.com" ;;
            "Maven") configure_maven ;;
            "Go") configure_go && ((success_count++)) ;;
            "Composer") configure_composer && ((success_count++)) ;;
            "Cargo") log_info "Cargo 配置请访问 https://mirror2030.com" ;;
            "Yarn") configure_yarn && ((success_count++)) ;;
            "PNPM") configure_pnpm && ((success_count++)) ;;
            "RubyGems") log_info "RubyGems 配置请访问 https://mirror2030.com" ;;
            "Conda") log_info "Conda 配置请访问 https://mirror2030.com" ;;
            "Homebrew") log_info "Homebrew 配置请访问 https://mirror2030.com" ;;
        esac
    done

    echo ""
    echo -e "${GREEN}================================${NC}"
    log_success "配置完成！成功配置 $success_count/$total_count 个工具"
    log_info "备份保存在: $BACKUP_DIR"
    echo -e "${GREEN}================================${NC}"
    echo ""
    read -p "按回车键返回主菜单..."
}

# 选择性换源
selective_configure() {
    show_banner
    echo -e "${CYAN}=== 选择换源 ===${NC}"
    echo ""

    if ! detect_tools; then
        read -p "按回车键返回..."
        return
    fi

    echo ""
    echo "检测到以下工具："
    for i in "${!AVAILABLE_TOOLS[@]}"; do
        echo "$((i+1))) ${AVAILABLE_TOOLS[$i]}"
    done
    echo "0) 返回主菜单"
    echo ""
    read -p "请选择要配置的工具 [0-${#AVAILABLE_TOOLS[@]}]: " tool_choice

    if [ "$tool_choice" -eq 0 ]; then
        return
    fi

    if [ "$tool_choice" -lt 1 ] || [ "$tool_choice" -gt ${#AVAILABLE_TOOLS[@]} ]; then
        log_error "无效选择"
        sleep 2
        return
    fi

    local selected_tool="${AVAILABLE_TOOLS[$((tool_choice-1))]}"

    if ! select_mirror; then
        return
    fi

    echo ""
    log_info "开始配置 $selected_tool..."
    create_backup_dir

    case $selected_tool in
        "NPM") configure_npm ;;
        "PIP") configure_pip ;;
        "PIP3") configure_pip3 ;;
        "Docker") configure_docker ;;
        "Yarn") configure_yarn ;;
        "PNPM") configure_pnpm ;;
        "Go") configure_go ;;
        "Composer") configure_composer ;;
        *) log_warning "该工具暂不支持自动配置，请访问 https://mirror2030.com" ;;
    esac

    echo ""
    read -p "按回车键返回主菜单..."
}

# 还原原设置
restore_settings() {
    show_banner
    echo -e "${CYAN}=== 还原原设置 ===${NC}"
    echo ""

    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
        log_warning "未找到备份文件"
        echo ""
        read -p "按回车键返回..."
        return
    fi

    log_info "找到以下备份："
    echo ""

    local backups=($(ls -t "$BACKUP_DIR"))
    for i in "${!backups[@]}"; do
        echo "$((i+1))) ${backups[$i]}"
    done
    echo "0) 返回主菜单"
    echo ""
    read -p "选择要还原的备份 [0-${#backups[@]}]: " backup_choice

    if [ "$backup_choice" -eq 0 ]; then
        return
    fi

    if [ "$backup_choice" -lt 1 ] || [ "$backup_choice" -gt ${#backups[@]} ]; then
        log_error "无效选择"
        sleep 2
        return
    fi

    local backup_file="${backups[$((backup_choice-1))]}"
    log_info "还原 $backup_file..."

    # 根据文件名判断类型并还原
    if [[ $backup_file == npmrc_* ]]; then
        local registry=$(cat "$BACKUP_DIR/$backup_file")
        npm config set registry "$registry"
        log_success "NPM 配置已还原"
    elif [[ $backup_file == sources.list_* ]]; then
        sudo cp "$BACKUP_DIR/$backup_file" /etc/apt/sources.list
        sudo apt update
        log_success "APT 配置已还原"
    elif [[ $backup_file == docker_daemon_* ]]; then
        sudo cp "$BACKUP_DIR/$backup_file" /etc/docker/daemon.json
        sudo systemctl restart docker
        log_success "Docker 配置已还原"
    else
        log_warning "无法自动识别备份类型，请手动还原"
    fi

    echo ""
    read -p "按回车键返回主菜单..."
}

# 查看当前配置
show_current_config() {
    show_banner
    echo -e "${CYAN}=== 当前配置 ===${NC}"
    echo ""

    if command -v npm >/dev/null 2>&1; then
        echo -e "${GREEN}NPM:${NC}"
        npm config get registry
        echo ""
    fi

    if command -v pip >/dev/null 2>&1; then
        echo -e "${GREEN}PIP:${NC}"
        pip config get global.index-url 2>/dev/null || echo "未配置"
        echo ""
    fi

    if command -v yarn >/dev/null 2>&1; then
        echo -e "${GREEN}Yarn:${NC}"
        yarn config get registry
        echo ""
    fi

    if command -v go >/dev/null 2>&1; then
        echo -e "${GREEN}Go:${NC}"
        go env GOPROXY
        echo ""
    fi

    if [ -f /etc/docker/daemon.json ]; then
        echo -e "${GREEN}Docker:${NC}"
        cat /etc/docker/daemon.json
        echo ""
    fi

    read -p "按回车键返回主菜单..."
}

# 主菜单
main_menu() {
    while true; do
        show_banner
        echo -e "${CYAN}=== 主菜单 ===${NC}"
        echo ""
        echo "1) 一键全局换源 (推荐)"
        echo "2) 选择换源 (指定工具)"
        echo "3) 还原原设置"
        echo "4) 查看当前配置"
        echo "5) 访问网站"
        echo "0) 退出"
        echo ""
        read -p "请选择操作 [0-5]: " choice

        case $choice in
            1) global_configure ;;
            2) selective_configure ;;
            3) restore_settings ;;
            4) show_current_config ;;
            5)
                echo ""
                log_info "浏览器访问: https://mirror2030.com"
                echo ""
                read -p "按回车键返回..."
                ;;
            0)
                echo ""
                log_success "感谢使用镜像加速站！"
                echo ""
                exit 0
                ;;
            *)
                log_error "无效选择"
                sleep 1
                ;;
        esac
    done
}

# 主程序入口
main() {
    # 检查网络连接
    if ! ping -c 1 mirror2030.com >/dev/null 2>&1; then
        log_warning "无法连接到 mirror2030.com，请检查网络"
    fi

    # 检测系统
    detect_os

    # 显示主菜单
    main_menu
}

# 运行主程序
main
