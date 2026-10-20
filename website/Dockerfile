FROM node:22-alpine

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install

COPY . .
RUN chmod +x scripts/start.sh
RUN pnpm build

EXPOSE 4321

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:4321/api/health').then(r=>r.json()).then(d=>{if(d.status!=='ok')process.exit(1)}).catch(()=>process.exit(1))" || exit 1

CMD ["sh", "scripts/start.sh"]