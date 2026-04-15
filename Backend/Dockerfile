FROM node:22-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Install dependencies first to maximize Docker layer caching.
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY . .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
	CMD node -e "const http=require('http');const req=http.get('http://127.0.0.1:3000/',(res)=>process.exit(res.statusCode===200?0:1));req.on('error',()=>process.exit(1));"

CMD ["npm", "run", "start:docker"]