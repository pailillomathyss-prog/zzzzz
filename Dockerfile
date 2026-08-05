FROM node:22-alpine

RUN npm install -g pnpm@10 --ignore-scripts

WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.base.json ./
COPY tsconfig.json ./

COPY lib/ ./lib/
COPY artifacts/discord-bot/ ./artifacts/discord-bot/

RUN pnpm install --no-frozen-lockfile --filter @workspace/discord-bot --filter @workspace/db --filter @workspace/api-spec --filter @workspace/api-zod --filter @workspace/api-client-react

CMD ["pnpm", "--filter", "@workspace/discord-bot", "run", "start"]
