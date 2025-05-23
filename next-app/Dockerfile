# Learn-Labs/next-app/Dockerfile

# Stage 1: Install dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Install libc6-compat for sharp, if you add it later for Image Optimization
# Or for other native dependencies. It's good to have.
RUN apk add --no-cache libc6-compat

# Copy package.json and lock file
COPY package.json package-lock.json* ./
# If you use yarn:
# COPY package.json yarn.lock ./
# If you use pnpm:
# COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm ci
# If you use yarn:
# RUN yarn install --frozen-lockfile
# If you use pnpm:
# RUN apk add --no-cache --virtual .gyp python3 make g++ && pnpm install --frozen-lockfile && apk del .gyp

# Stage 2: Build the Next.js application
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy all source files
COPY . .

# Set Next.js telemetry to disabled
ENV NEXT_TELEMETRY_DISABLED 1

# Environment variables needed AT BUILD TIME
# These will be passed in during the `docker build` command (or via Cloud Build arguments)
# For any NEXT_PUBLIC_ variables your application needs during the build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
# Add other NEXT_PUBLIC_ build-time variables here as ARGs if needed

# Make ARG values available as ENV vars for the build process
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
# Add other NEXT_PUBLIC_ ENV assignments here if needed

# Build the Next.js application
# This will use the .env variables made available above for the build
RUN npm run build

# Stage 3: Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy public assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Copy static assets (they are not part of standalone output but served by Next.js)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set the user for the container
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Environment variable for the port (Cloud Run will set this automatically)
# You can remove this if your app correctly uses process.env.PORT
ENV PORT 3000

# Command to run the application
# Note: For standalone output, the server is started directly with node
CMD ["node", "server.js"]