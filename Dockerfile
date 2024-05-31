FROM node:20 AS base
LABEL App="ev-server"

WORKDIR /usr/app
COPY . ./

# Enable corepack and pnpm
RUN corepack enable \
  && corepack prepare pnpm@latest --activate

FROM base as prod-deps
# Install production dependencies
# Use a cache if available
RUN --mount=type=cache,id=pnpm,target=pnpm/store pnpm install --prod --frozen-lockfile

# Create build image for compiling typescript code
FROM base as build
# Install all dependencies
RUN --mount=type=cache,id=pnpm,target=pnpm/store pnpm install --frozen-lockfile
# Build the project
RUN pnpm run build

# Create an image base
FROM base
# Copy production dependencies from the prod-deps stage
COPY --from=prod-deps /usr/app/node_modules /usr/app/node_modules
# Copy the compiled code from the build stage
COPY --from=build /usr/app/dist /usr/app/dist

# Expose the port
EXPOSE 3000

# Start the application

CMD sleep 60 && pnpm run db:node && pnpm start