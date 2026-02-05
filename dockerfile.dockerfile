# 使用 Nginx 作为静态文件服务器
FROM nginx:alpine

# 复制所有文件到 Nginx 的 HTML 目录
COPY . /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]