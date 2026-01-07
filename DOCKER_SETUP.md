# 🐳 Docker Setup Guide

Complete guide to run the Skin Cancer Detection System using Docker.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ RAM available
- 10GB+ disk space

## 🚀 Quick Start

### 1. Setup Environment Variables

```bash
# Copy the example environment file
cp .env.docker .env

# Edit .env and add your API keys
nano .env  # or use your preferred editor
```

**Required API Keys:**
- `ROBOFLOW_API_KEY` - Get from [Roboflow](https://roboflow.com/)
- `GROQ_API_KEY` - Get from [Groq](https://groq.com/)

### 2. Start All Services

```bash
# Build and start all containers
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Database**: localhost:5432
- **pgAdmin** (optional): http://localhost:5050

---

## 📦 Services

### Frontend (React + Nginx)
- Port: 3000
- Technology: React 18, Vite, Tailwind CSS
- Served by: Nginx (optimized for production)

### Backend (Flask + Python)
- Port: 5001
- Technology: Flask, SQLAlchemy, PostgreSQL
- Features: ML model, API endpoints, PDF generation

### Database (PostgreSQL)
- Port: 5432
- Version: PostgreSQL 15
- Volume: Persistent storage

### pgAdmin (Optional)
- Port: 5050
- Use: Database management UI
- Enable with: `docker-compose --profile dev up -d`

---

## 🛠️ Common Commands

### Start Services
```bash
# Start all services
docker-compose up -d

# Start with pgAdmin (development)
docker-compose --profile dev up -d

# Start specific service
docker-compose up -d backend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuild Containers
```bash
# Rebuild all
docker-compose build --no-cache

# Rebuild specific service
docker-compose build --no-cache backend
```

### Database Management
```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U skin_cancer_user -d skin_cancer_db

# Run migrations
docker-compose exec backend flask db upgrade

# Create new migration
docker-compose exec backend flask db migrate -m "Description"

# Backup database
docker-compose exec postgres pg_dump -U skin_cancer_user skin_cancer_db > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U skin_cancer_user -d skin_cancer_db
```

### Container Management
```bash
# List running containers
docker-compose ps

# Restart service
docker-compose restart backend

# Execute command in container
docker-compose exec backend bash

# View resource usage
docker stats
```

---

## 📁 Docker Files Structure

```
skin-cancer/
├── Dockerfile                 # Backend container
├── docker-compose.yml         # Orchestration file
├── .dockerignore             # Backend ignore rules
├── init-db.sql               # Database initialization
├── .env.docker               # Environment template
└── frontend/
    ├── Dockerfile            # Frontend container
    ├── nginx.conf            # Nginx configuration
    └── .dockerignore         # Frontend ignore rules
```

---

## 🔧 Configuration

### Environment Variables

Edit `.env` file to configure:

```bash
# Database
POSTGRES_DB=skin_cancer_db
POSTGRES_USER=skin_cancer_user
POSTGRES_PASSWORD=your_secure_password

# API Keys
ROBOFLOW_API_KEY=your_key
GROQ_API_KEY=your_key

# Security
SECRET_KEY=your-secret-key
```

### Network Configuration

All services run on the `skin-cancer-network` bridge network:
- Services can communicate using service names
- Backend URL: `http://backend:5001`
- Database URL: `postgres:5432`

### Volume Persistence

Data is persisted in Docker volumes:
- `postgres_data` - Database files
- `pgadmin_data` - pgAdmin settings
- `./static/uploads` - Uploaded images (bind mount)
- `./instance` - SQLite backup (bind mount)

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000  # or 5001, 5432

# Change port in docker-compose.yml
ports:
  - "3001:80"  # Change 3000 to 3001
```

### Database Connection Failed

```bash
# Check if database is healthy
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Backend Not Starting

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Missing API keys in .env
# 2. Database not ready - wait 30s
# 3. Migration errors - check migrations/
```

### Frontend Not Loading

```bash
# Check if backend is running
curl http://localhost:5001/api/history/stats

# Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Clear Everything and Start Fresh

```bash
# Stop and remove everything
docker-compose down -v

# Remove all images
docker-compose rm -f
docker rmi $(docker images -q skin-cancer*)

# Start fresh
docker-compose up -d --build
```

---

## 🔒 Security Best Practices

### Production Deployment

1. **Change Default Passwords**
   ```bash
   POSTGRES_PASSWORD=strong-random-password
   SECRET_KEY=long-random-string
   ```

2. **Use Secrets Management**
   - Docker Secrets
   - Environment variable encryption
   - Vault services

3. **Enable HTTPS**
   - Add SSL certificates
   - Configure Nginx for HTTPS
   - Update CORS settings

4. **Restrict Network Access**
   ```yaml
   postgres:
     ports: []  # Remove port exposure
   ```

5. **Update Regular**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

---

## 📊 Monitoring

### Health Checks

All services have health checks configured:

```bash
# View health status
docker-compose ps

# Test endpoints
curl http://localhost:5001/api/history/stats  # Backend
curl http://localhost:3000                     # Frontend
```

### Resource Usage

```bash
# Monitor resource usage
docker stats

# Set resource limits in docker-compose.yml:
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

---

## 🚢 Production Deployment

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml skin-cancer

# Scale services
docker service scale skin-cancer_backend=3
```

### Using Kubernetes

```bash
# Convert docker-compose to k8s
kompose convert

# Deploy to k8s
kubectl apply -f .
```

### Cloud Platforms

- **AWS ECS**: Use `docker-compose.yml` with ECS
- **Google Cloud Run**: Deploy individual containers
- **Azure Container Instances**: Use container groups
- **DigitalOcean Apps**: Deploy from Docker Hub

---

## 🔄 Updates & Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build
```

### Database Migrations

```bash
# Run migrations
docker-compose exec backend flask db upgrade

# Rollback migration
docker-compose exec backend flask db downgrade
```

### Backup Strategy

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec postgres pg_dump -U skin_cancer_user skin_cancer_db > backup_$DATE.sql
```

---

## 📞 Support

Issues? Check:
1. Docker logs: `docker-compose logs`
2. Environment variables in `.env`
3. Port availability: `lsof -i :PORT`
4. Docker resources: `docker stats`

---

**Version:** 2.0.0  
**Last Updated:** January 2026  
**Docker Compose Version:** 3.8
