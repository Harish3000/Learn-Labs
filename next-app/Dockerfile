# Learn-Labs/next-app/Dockerfile

# Stage 1: Install dependencies
FROM node:18-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build the Next.js application
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

# --- BEGIN: ADD PLACEHOLDER ENV VARS FOR BUILD ---
# Active learning Component
ENV NEXT_PUBLIC_SUPABASE_URL="http://placeholder.supabase.url"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="placeholder_supabase_anon_key"
ENV NEXT_PUBLIC_GEMINI_API_KEY="placeholder_gemini_key"
ENV NEXT_PUBLIC_GEMINI_API_KEY_ACTIVE_LEARNING="placeholder_gemini_active_learning_key"
ENV NEXT_PUBLIC_YOUTUBE_API_KEY="placeholder_youtube_key"
ENV NEXT_PUBLIC_ASSEMBLYAI_API_KEY="placeholder_assemblyai_key"
ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="placeholder_cloudinary_cloud_name"
ENV NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="placeholder_cloudinary_upload_preset"
ENV NEXT_PUBLIC_CLOUDINARY_API_KEY="placeholder_cloudinary_api_key"
ENV CLOUDINARY_API_SECRET="placeholder_cloudinary_api_secret"

# Doubt Clarification component
ENV NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY_DOUBT_CLA="placeholder_gemini_doubt_cla_key"
ENV NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY_DOUBT_CLAz="placeholder_gemini_doubt_claz_key"

# Collaborative Summarization component
ENV NEXT_PUBLIC_COLLAB_SUMMARY_GEMINI_API_KEY="placeholder_collab_summary_gemini_key"
ENV NEXT_PUBLIC_COLLAB_SUMMARY_MODEL_NAME="placeholder_collab_summary_model_name"
ENV NEXT_PUBLIC_ZEGO_APP_ID="placeholder_zego_app_id"
ENV NEXT_PUBLIC_ZEGO_SERVER_SECRET="placeholder_zego_server_secret"

# Intellinotes
ENV GOOGLE_GENERATIVE_AI_API_KEY_intellinote="placeholder_intellinote_gemini_key"
ENV CONVEX_DEPLOYMENT="placeholder_convex_deployment"
ENV NEXT_PUBLIC_CONVEX_URL="http://placeholder.convex.url"

# Stripe
ENV NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_placeholder_stripe_public_key"
ENV STRIPE_SECRET_KEY="sk_placeholder_stripe_secret_key" # This is likely the one causing the error
# --- END: ADD PLACEHOLDER ENV VARS FOR BUILD ---

# Build the Next.js application
# This will use the ENV variables defined above for the build
RUN npm run build

# Stage 3: Production image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]