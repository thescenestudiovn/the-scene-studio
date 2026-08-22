FROM node:20-alpine

WORKDIR /app

COPY server.js ./server.js

ENV HOST=0.0.0.0
ENV PORT=8787
ENV UPLOAD_ROOT=/mnt/md0/media

EXPOSE 8787

CMD ["node", "server.js"]
