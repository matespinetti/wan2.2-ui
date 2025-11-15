# Deployment Guide - Wan 2.2 Video Generator

## Quick Start

Deploy this Next.js video generator to your VPS at `video.labfab.ca` using Docker and Caddy reverse proxy.

## Prerequisites

- Docker & Docker Compose installed
- DNS record for `video.labfab.ca` pointing to your VPS
- Existing Caddy reverse proxy (or will create new one)
- RunPod API credentials

## Deployment Steps

### 1. Prepare Environment Variables

Copy the example file and add your RunPod credentials:

```bash
cd /home/matespinetti/projects/wan2.2-ui

# Copy environment template
cp .env.example .env

# Edit with your RunPod credentials
nano .env
```

Add your credentials to `.env`:
```bash
RUNPOD_API_KEY=your_secret_key_here
RUNPOD_ENDPOINT_ID=eyijc6vd8jhy24
NEXT_PUBLIC_APP_URL=https://video.labfab.ca
NEXT_PUBLIC_MAX_TIMEOUT=2500
```

### 2. Build the Docker Image

```bash
# Build the production image
docker build -t wan-video-generator:latest .

# Verify build (should be ~150MB)
docker images | grep wan-video-generator
```

Expected output:
```
wan-video-generator   latest   abc123def456   2 minutes ago   150MB
```

### 3. Deploy with Docker Compose

```bash
# Start the service
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f wan-video-generator
```

Expected output:
```
wan-video-generator  | > next start
wan-video-generator  | ▲ Next.js 14.2.33
wan-video-generator  | - Local:        http://localhost:3000
wan-video-generator  | ✓ Ready in 2s
```

### 4. Configure Caddy Reverse Proxy

#### Option A: Standalone Caddy (New Setup)

If you don't have Caddy running yet:

```bash
# The docker-compose.yml already includes Caddy
# Just ensure the Caddyfile is in place
docker-compose up -d caddy

# Verify SSL certificate
curl -v https://video.labfab.ca 2>&1 | grep "subject"
```

#### Option B: Existing Caddy Instance (Recommended)

If you already have Caddy running (like with your OpenWebUI setup):

1. **Copy the video.labfab.ca block** from `Caddyfile` to your existing Caddyfile
2. **Reload Caddy** without downtime:

```bash
# Copy to your existing Caddyfile location
# Example: ~/fred-openwebui/Caddyfile

# Add this block to your existing Caddyfile:
cat >> ~/fred-openwebui/Caddyfile << 'EOF'

# Video Generator Domain
video.labfab.ca {
  encode gzip zstd
  reverse_proxy wan-video-generator:3000 {
    header_up X-Real-IP {remote_host}
    header_up X-Forwarded-For {remote_host}
    header_up X-Forwarded-Proto {scheme}
    header_up Host {host}
    health_uri /api/health
    health_interval 30s
    health_timeout 10s
  }
  header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    X-Content-Type-Options "nosniff"
    X-Frame-Options "SAMEORIGIN"
    X-XSS-Protection "1; mode=block"
    Referrer-Policy "strict-origin-when-cross-origin"
    -Server
  }
}
EOF

# Reload Caddy configuration
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

### 5. Verify Deployment

```bash
# Test health endpoint
curl https://video.labfab.ca/api/health

# Expected response:
# {"status":"ok","timestamp":"2025-01-14T...","service":"wan-video-generator"}

# Test main page
curl -I https://video.labfab.ca

# Expected: HTTP/2 200
```

### 6. Monitor the Application

```bash
# View real-time logs
docker logs -f wan-video-generator

# Check container health
docker inspect wan-video-generator | grep -A 10 "Health"

# View resource usage
docker stats wan-video-generator

# Check persistent volumes
docker volume ls | grep wan
docker volume inspect wan-videos
```

## Network Configuration

The application connects to your existing Docker network (`ollama-proxy-network`).

```
Internet → Caddy:443 → wan-video-generator:3000 (internal)
          (SSL/TLS)     (Docker DNS)
```

**Network flow:**
1. Caddy receives HTTPS request for `video.labfab.ca`
2. Caddy forwards to `wan-video-generator:3000` (Docker internal DNS)
3. Next.js processes request and returns response
4. Caddy adds security headers and returns to client

## Persistence & Backups

### Video Storage

Generated videos are stored in a named Docker volume:

```bash
# Location
/var/lib/docker/volumes/wan-videos/_data/

# Backup videos
docker run --rm \
  -v wan-videos:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/wan-videos-$(date +%Y%m%d).tar.gz -C /data .

# Restore videos
docker run --rm \
  -v wan-videos:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/wan-videos-YYYYMMDD.tar.gz -C /data
```

### Full System Backup

```bash
# Stop containers
docker-compose down

# Backup volumes
docker run --rm -v wan-videos:/data -v $(pwd):/backup \
  alpine tar czf /backup/wan-videos.tar.gz -C /data .

# Backup .env file (IMPORTANT - contains secrets)
cp .env .env.backup

# Start containers
docker-compose up -d
```

## Troubleshooting

### Container Exits Immediately

```bash
# Check logs
docker logs wan-video-generator

# Common issues:
# - Missing .env file
# - Invalid RUNPOD credentials
# - Port 3000 already in use
```

### Health Check Failing

```bash
# Test health endpoint directly
docker exec wan-video-generator curl http://localhost:3000/api/health

# If failing, check Next.js is running:
docker exec wan-video-generator ps aux
```

### Caddy Can't Reach Container

```bash
# Verify network
docker network inspect ollama-proxy-network

# Ensure both services are on same network:
docker network connect ollama-proxy-network wan-video-generator
```

### SSL Certificate Not Issued

```bash
# Check DNS propagation
nslookup video.labfab.ca

# Check Caddy logs
docker logs caddy | grep video.labfab.ca

# Force certificate renewal
docker exec caddy caddy reload --force
```

### Videos Not Persisting

```bash
# Check volume exists
docker volume inspect wan-videos

# Verify mount in container
docker exec wan-video-generator ls -la /app/public/videos
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker resources
docker system prune -a --volumes

# Remove old images
docker image prune -a --filter "until=720h"
```

## Updating the Application

### Update Code

```bash
# Pull latest code
cd /home/matespinetti/projects/wan2.2-ui
git pull  # if using git

# Rebuild image
docker-compose build

# Restart with new image
docker-compose up -d

# Verify
docker-compose logs -f wan-video-generator
```

### Update Dependencies

```bash
# Update package.json locally
npm update

# Rebuild Docker image
docker build -t wan-video-generator:latest .

# Restart
docker-compose up -d
```

## Resource Management

### Current Limits

- **CPU**: 2 cores max, 1 core reserved
- **Memory**: 1GB max, 512MB reserved

### Adjust Resources

Edit `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '4'      # Increase to 4 cores
      memory: 2G     # Increase to 2GB
```

Then restart:
```bash
docker-compose up -d
```

## Security Checklist

- ✅ Non-root user in container (nextjs:1001)
- ✅ Minimal Alpine Linux base
- ✅ Security headers configured
- ✅ HSTS enabled
- ✅ Secrets in gitignored .env
- ✅ Health checks enabled
- ✅ Resource limits configured
- ✅ Logging with rotation

## Monitoring & Alerts

### View Metrics

```bash
# Container stats
docker stats wan-video-generator

# Disk usage
docker system df

# Network connections
docker exec wan-video-generator netstat -tuln
```

### Log Analysis

```bash
# Application logs
docker logs wan-video-generator | grep ERROR

# Caddy access logs
docker exec caddy cat /data/access-video.log | jq

# Filter for 500 errors
docker logs wan-video-generator | grep "500"
```

## Maintenance Commands

```bash
# Restart service
docker-compose restart wan-video-generator

# Stop service
docker-compose stop wan-video-generator

# Remove service (keeps volumes)
docker-compose down

# Remove everything (INCLUDING VIDEOS!)
docker-compose down -v  # ⚠️ DANGER: Deletes volumes

# Update and restart
docker-compose pull && docker-compose up -d

# View service configuration
docker-compose config
```

## Performance Optimization

### Enable Caching

Add to Caddyfile:

```caddyfile
video.labfab.ca {
  # Cache static assets
  @static {
    path *.js *.css *.png *.jpg *.svg *.woff2
  }
  header @static Cache-Control "public, max-age=31536000, immutable"

  # Rest of config...
}
```

### Scale Horizontally

To run multiple instances:

```yaml
# docker-compose.yml
services:
  wan-video-generator:
    deploy:
      replicas: 3  # Run 3 instances
```

Then Caddy will load balance automatically.

## Support & Debugging

### Enable Debug Logging

```yaml
# docker-compose.yml
environment:
  DEBUG: "*"
  LOG_LEVEL: debug
```

### Access Container Shell

```bash
# Access running container
docker exec -it wan-video-generator sh

# Inspect files
cd /app
ls -la

# Check environment
env | grep RUNPOD
```

### Check Build Details

```bash
# View build history
docker history wan-video-generator:latest

# Inspect image
docker inspect wan-video-generator:latest | jq
```

## Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Caddy Documentation](https://caddyserver.com/docs/)
- [RunPod API Reference](https://docs.runpod.io/)

## Questions?

Check the main [README.md](./README.md) for application features and usage.

For deployment issues, review logs and health checks first:
```bash
docker logs wan-video-generator
curl https://video.labfab.ca/api/health
```
