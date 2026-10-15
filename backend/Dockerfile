FROM node:22-alpine

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install

COPY . .
RUN chmod +x scripts/start.sh
RUN pnpm build

EXPOSE 3000

ENV NODE_ENV=production

HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=10 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>r.json()).then(d=>{if(!d.payloadReady)process.exit(1)}).catch(()=>process.exit(1))" || exit 1

CMD ["sh", "scripts/start.sh"]