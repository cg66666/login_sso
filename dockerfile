# 使用 Nginx 的官方镜像作为基础镜像
FROM nginx:latest

# 复制自定义的 Nginx 配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 复制 HTML 文件到 Nginx 的默认网站目录
COPY src/. /usr/share/nginx/html/

# 暴露端口
EXPOSE 80

# 告诉 Docker 使用默认的 Nginx 命令启动 Nginx 服务
CMD ["nginx", "-g", "daemon off;"]