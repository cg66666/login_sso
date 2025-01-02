# 使用 Nginx 的官方镜像作为基础镜像
FROM nginx:alpine

# 复制自定义的 Nginx 配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 复制 HTML 文件到 Nginx 的默认网站目录
COPY . /usr/share/nginx/html/

# 告诉 Docker 使用默认的 Nginx 命令启动 Nginx 服务
CMD ["nginx", "-g", "daemon off;"]