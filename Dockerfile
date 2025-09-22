# Build stage
FROM node:22-slim AS builder

WORKDIR /var/task

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install

COPY . .
RUN pnpm run build

# Production stage
FROM node:22-slim AS production

WORKDIR /var/task

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.0 /lambda-adapter /opt/extensions/lambda-adapter
COPY --from=builder /var/task/.mastra .mastra
COPY --from=builder /var/task/node_modules node_modules

ENV AWS_LAMBDA_EXEC_WRAPPER=/opt/bootstrap
ENV PORT=8080
ENV NODE_ENV=production
ENV READINESS_CHECK_PATH="/api"

EXPOSE 8080

CMD [ "node", "--import=./.mastra/output/instrumentation.mjs", ".mastra/output/index.mjs" ]