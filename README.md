# Library Management System - Complete Docker & Kubernetes Deployment

## Overview

This project has been fully dockerized and is ready for deployment to Kubernetes (minikube). The application consists of three main components:

1. **Backend API** - Node.js/Express server with MongoDB
2. **Frontend** - Static HTML/JS served via HTTP server
3. **MongoDB** - Database for persistent data storage

---

## What's Been Done

### 1. ✅ Docker Optimization
- **Improved Dockerfiles** with multi-stage builds for optimization
- **Added .dockerignore** files to reduce image sizes
- **Non-root users** for security in both containers
- **Health checks** for container monitoring
- **Optimized dependencies** - production only in final images

### 2. ✅ Docker Compose Setup
- **docker-compose.yml** for local testing and development
- All three services (backend, frontend, MongoDB) configured
- Health checks and networking configured
- Volumes for MongoDB persistence

### 3. ✅ Kubernetes Manifests
- **backend.yaml** - Deployment with 2 replicas and service
- **frontend.yaml** - Deployment with 2 replicas and service  
- **mongodb.yaml** - StatefulSet for database with persistent storage
- **configmap.yaml** - Application configuration
- **secret.yaml** - Sensitive credentials
- **ingress.yaml** - Optional ingress configuration

### 4. ✅ Deployment Automation
- **deploy-minikube.sh** - Bash script for automated deployment (Linux/Mac)
- **deploy-minikube.ps1** - PowerShell script for Windows deployment
- **cleanup-minikube.sh** - Script to clean up resources

### 5. ✅ Documentation
- **DEPLOYMENT_GUIDE.md** - Comprehensive step-by-step guide
- **This README** - Quick start and overview

---

## Quick Start

### Prerequisites
1. Docker Desktop installed and running
2. Minikube installed
3. kubectl installed (comes with Docker Desktop)

### Fastest Way to Deploy

#### For Windows (PowerShell):
```powershell
cd "c:\Users\Karnika Chinmayi\Desktop\Lib_Mng_Sys\lib-management-DevOps-project-main - Copy"
.\k8s\deploy-minikube.ps1
```

#### For Linux/Mac:
```bash
cd path/to/lib-management-DevOps-project-main
chmod +x k8s/deploy-minikube.sh
./k8s/deploy-minikube.sh
```

#### For Windows Without Script:
```powershell
# Start Docker Desktop first!

# Start Minikube
minikube start --cpus=4 --memory=4096

# Enable addons
minikube addons enable metrics-server
minikube addons enable ingress

# Setup Docker environment
minikube docker-env | Invoke-Expression

# Build images
docker build -t library-backend:latest ./backend
docker build -t library-frontend:latest ./frontend

# Create namespace and deploy
kubectl create namespace library-management
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml

# Check status
kubectl get pods -n library-management
```

---

## Access the Application

### Option 1: Port Forward (Simplest)
```powershell
# Terminal 1
kubectl port-forward svc/frontend 8080:8080 -n library-management

# Terminal 2  
kubectl port-forward svc/backend 5000:5000 -n library-management

# Access in browser
# Frontend: http://localhost:8080
# Backend API: http://localhost:5000/api/health
```

### Option 2: Using Minikube Service
```powershell
minikube service frontend -n library-management
minikube service backend -n library-management
```

### Option 3: Get External IP/Port
```powershell
# Get Minikube IP
$IP = minikube ip

# Get service ports
kubectl get svc -n library-management

# Access
# http://<minikube-ip>:<frontend-port>
# http://<minikube-ip>:<backend-port>
```

---

## Default Credentials

| Field | Value |
|-------|-------|
| Admin Email | admin@library.com |
| Admin Password | admin123 |
| MongoDB Username | admin |
| MongoDB Password | admin123 |

---

## Cleanup

### Remove all resources
```powershell
# Delete namespace (removes all resources in it)
kubectl delete namespace library-management

# Stop minikube
minikube stop

# Delete minikube completely
minikube delete
```

---

## Important Notes

### Image Pull Policy
- Set to `Never` in K8s manifests for local minikube
- Change to `IfNotPresent` or `Always` for production with registries

### Health Checks
- Backend uses HTTP liveness/readiness probes on `/api/health`
- Frontend uses HTTP probes on `/`
- MongoDB uses exec probes with mongosh commands

---

## Support & Documentation

- **Detailed Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Kubernetes Docs**: https://kubernetes.io/docs/
- **Minikube Docs**: https://minikube.sigs.k8s.io/
- **Docker Docs**: https://docs.docker.com/

---

## Summary

✅ Project is fully dockerized with:
- Production-ready Dockerfiles
- Docker Compose for local testing
- Complete Kubernetes manifests
- Automated deployment scripts
- Comprehensive documentation

Ready to deploy to minikube immediately!

---

**Created**: January 7, 2026  
**Project**: Library Management System - DevOps  
**Status**: ✅ Ready for Deployment