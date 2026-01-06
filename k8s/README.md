# Kubernetes Deployment Guide

## Prerequisites
- Kubernetes cluster (v1.20+)
- kubectl configured
- NGINX Ingress Controller installed
- Docker images pushed to registry

## Building and Pushing Docker Images

```bash
# Backend
cd backend
docker build -t library-backend:latest .
docker tag library-backend:latest <your-registry>/library-backend:latest
docker push <your-registry>/library-backend:latest

# Frontend
cd frontend
docker build -t library-frontend:latest .
docker tag library-frontend:latest <your-registry>/library-frontend:latest
docker push <your-registry>/library-frontend:latest
```

## Deployment Steps

### Option 1: Using deployment script
```bash
cd k8s
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual deployment
```bash
cd k8s
kubectl apply -f namespace.yaml
kubectl apply -f secret.yaml
kubectl apply -f configmap.yaml
kubectl apply -f mongodb.yaml
kubectl apply -f backend.yaml
kubectl apply -f frontend.yaml
kubectl apply -f ingress.yaml
```

## Files Overview

- **namespace.yaml** - Creates isolated namespace
- **secret.yaml** - Stores sensitive data (credentials)
- **configmap.yaml** - Environment variables
- **mongodb.yaml** - MongoDB StatefulSet with persistent storage
- **backend.yaml** - Backend Deployment with 2 replicas
- **frontend.yaml** - Frontend Deployment with 2 replicas
- **ingress.yaml** - NGINX Ingress for external access

## Verify Deployment

```bash
# Check pods
kubectl get pods -n library-management

# Check services
kubectl get svc -n library-management

# Check ingress
kubectl get ingress -n library-management

# View logs
kubectl logs -f deployment/backend -n library-management
kubectl logs -f deployment/frontend -n library-management
```

## Update /etc/hosts for local access
Add to your `/etc/hosts` file:
```
127.0.0.1 library.local
```

## Cleanup

```bash
kubectl delete namespace library-management
```
