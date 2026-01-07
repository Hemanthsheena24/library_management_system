# Complete Docker & Minikube Deployment Guide

## Project: Library Management System

This guide will help you completely dockerize and deploy the library management system to minikube.

---

## Prerequisites

1. **Docker Desktop** - Download from https://www.docker.com/products/docker-desktop
2. **Minikube** - Download from https://minikube.sigs.k8s.io/docs/start/
3. **kubectl** - Included with Docker Desktop or install from https://kubernetes.io/docs/tasks/tools/

### Installation Steps (Windows)

#### 1. Install Docker Desktop
```powershell
# Using Chocolatey (recommended)
choco install docker-desktop

# Or download from https://www.docker.com/products/docker-desktop
```

#### 2. Install Minikube
```powershell
# Using Chocolatey
choco install minikube

# Or download from https://minikube.sigs.k8s.io/docs/start/
```

#### 3. Start Docker Desktop
- Launch Docker Desktop from Start Menu
- Wait for Docker daemon to start (check system tray)

---

## Project Structure Overview

```
lib-management-DevOps-project-main - Copy/
├── backend/
│   ├── Dockerfile           (Optimized multi-stage build)
│   ├── .dockerignore        (Docker build optimizations)
│   ├── server.js
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       └── routes/
├── frontend/
│   ├── Dockerfile           (Optimized multi-stage build)
│   ├── .dockerignore        (Docker build optimizations)
│   ├── package.json
│   ├── index.html
│   ├── login.html
│   └── [other static files]
├── k8s/
│   ├── deploy-minikube.sh   (Complete deployment script)
│   ├── cleanup-minikube.sh  (Cleanup script)
│   ├── backend.yaml         (K8s Backend Deployment & Service)
│   ├── frontend.yaml        (K8s Frontend Deployment & Service)
│   ├── mongodb.yaml         (K8s MongoDB StatefulSet)
│   ├── configmap.yaml       (K8s ConfigMap)
│   ├── secret.yaml          (K8s Secrets)
│   └── ingress.yaml         (K8s Ingress - optional)
├── docker-compose.yml       (For local testing)
└── README.md
```

---

## Step 1: Verify Docker Installation

```powershell
docker --version
docker ps
```

Expected output:
```
Docker version 29.1.3, build f52814d
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

---

## Step 2: Build Docker Images

### Option A: Using Terminal Commands

Navigate to the project directory and build both images:

```powershell
cd "c:\Users\Karnika Chinmayi\Desktop\Lib_Mng_Sys\lib-management-DevOps-project-main - Copy"

# Build backend
docker build -t library-backend:latest ./backend

# Build frontend
docker build -t library-frontend:latest ./frontend
```

Verify images were built:
```powershell
docker images | grep library
```

### Option B: Using docker-compose for Local Testing

```powershell
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Backend API on port 5000
- Frontend on port 8080

Test the services:
```powershell
# Test backend health
curl http://localhost:5000/api/health

# Access frontend
# Open browser: http://localhost:8080
```

To stop local services:
```powershell
docker-compose down
```

---

## Step 3: Start Minikube

```powershell
# Start with recommended settings for this project
minikube start --cpus=4 --memory=4096 --disk-size=20gb

# Verify minikube is running
minikube status

# Get minikube IP
minikube ip
```

Expected output:
```
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

---

## Step 4: Configure Docker to Use Minikube's Docker Daemon

This is crucial - your Docker images need to be built in minikube's Docker environment:

```powershell
# For Windows PowerShell:
minikube docker-env | Invoke-Expression

# Verify by checking docker context
docker context ls
```

---

## Step 5: Build Images in Minikube Context

```powershell
# Make sure you're using minikube's docker daemon
minikube docker-env | Invoke-Expression

# Build backend image
docker build -t library-backend:latest ./backend

# Build frontend image
docker build -t library-frontend:latest ./frontend

# Verify images exist in minikube
docker images | grep library
```

---

## Step 6: Enable Required Minikube Addons

```powershell
# Enable metrics-server
minikube addons enable metrics-server

# Enable ingress controller
minikube addons enable ingress
```

---

## Step 7: Deploy to Minikube

### Method A: Using Automated Script (Linux/Mac)

If on WSL2 or Linux:
```bash
chmod +x k8s/deploy-minikube.sh
./k8s/deploy-minikube.sh
```

### Method B: Manual Deployment (Windows/Cross-platform)

```powershell
cd "c:\Users\Karnika Chinmayi\Desktop\Lib_Mng_Sys\lib-management-DevOps-project-main - Copy"

# Create namespace
kubectl create namespace library-management

# Apply configurations
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Deploy MongoDB
kubectl apply -f k8s/mongodb.yaml

# Wait for MongoDB to be ready
kubectl wait --for=condition=Ready pod -l app=mongodb -n library-management --timeout=300s

# Deploy Backend
kubectl apply -f k8s/backend.yaml

# Wait for Backend to be ready
kubectl wait --for=condition=Ready pod -l app=backend -n library-management --timeout=300s

# Deploy Frontend
kubectl apply -f k8s/frontend.yaml

# Wait for Frontend to be ready
kubectl wait --for=condition=Ready pod -l app=frontend -n library-management --timeout=300s
```

---

## Step 8: Verify Deployment

```powershell
# Check namespace
kubectl get namespace library-management

# Check all resources
kubectl get all -n library-management

# Check pod status
kubectl get pods -n library-management

# Check services
kubectl get svc -n library-management

# Check detailed pod information
kubectl describe pod -n library-management
```

Expected output:
```
NAME                       READY   STATUS    RESTARTS   AGE
pod/backend-xxxxx          1/1     Running   0          2m
pod/frontend-xxxxx         1/1     Running   0          2m
pod/mongodb-0              1/1     Running   0          3m

NAME                 TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/backend      ClusterIP   10.x.x.x        <none>        5000/TCP   2m
service/frontend     ClusterIP   10.x.x.x        <none>        8080/TCP   2m
service/mongodb      ClusterIP   None            <none>        27017/TCP  3m
```

---

## Step 9: Access the Application

### Option A: Port Forward (Simplest)

```powershell
# Terminal 1: Forward backend
kubectl port-forward svc/backend 5000:5000 -n library-management

# Terminal 2: Forward frontend
kubectl port-forward svc/frontend 8080:8080 -n library-management

# Access in browser:
# Frontend: http://localhost:8080
# Backend API: http://localhost:5000/api/health
```

### Option B: NodePort Service (Alternative)

```powershell
# Change services to NodePort
kubectl patch service backend -n library-management -p '{"spec":{"type":"NodePort"}}'
kubectl patch service frontend -n library-management -p '{"spec":{"type":"NodePort"}}'

# Get minikube IP and ports
$MINIKUBE_IP = minikube ip
kubectl get svc -n library-management

# Access URLs
# Backend: http://<minikube-ip>:<backend-nodeport>
# Frontend: http://<minikube-ip>:<frontend-nodeport>
```

### Option C: Using Minikube Service

```powershell
# Open services in browser automatically
minikube service backend -n library-management
minikube service frontend -n library-management
```

---

## Step 10: View Logs and Debug

```powershell
# View pod logs
kubectl logs -n library-management -l app=backend
kubectl logs -n library-management -l app=frontend
kubectl logs -n library-management -l app=mongodb

# View logs from specific pod
kubectl logs -n library-management pod/backend-xxxxx

# Follow logs in real-time
kubectl logs -f -n library-management -l app=backend

# Exec into a pod for debugging
kubectl exec -it pod/backend-xxxxx -n library-management -- /bin/sh

# Describe pod details
kubectl describe pod pod/backend-xxxxx -n library-management
```

---

## Step 11: Useful Minikube Commands

```powershell
# Open Minikube Dashboard
minikube dashboard

# SSH into minikube
minikube ssh

# Get minikube IP
minikube ip

# Stop minikube
minikube stop

# Start minikube again
minikube start

# Delete minikube
minikube delete
```

---

## Default Login Credentials

The backend automatically creates a default admin user on startup:

```
Email: admin@library.com
Password: admin123
```

---

## Troubleshooting

### Issue: Pods stuck in "Pending" or "ImagePullBackOff"

**Solution:** Make sure images were built in minikube's Docker context:
```powershell
minikube docker-env | Invoke-Expression
docker build -t library-backend:latest ./backend
docker build -t library-frontend:latest ./frontend
docker images
```

### Issue: MongoDB connection timeout

**Solution:** Check MongoDB pod status and logs:
```powershell
kubectl logs -n library-management -l app=mongodb
kubectl describe pod -n library-management -l app=mongodb
```

### Issue: Backend failing to connect to MongoDB

**Solution:** Verify MongoDB connection string:
```powershell
kubectl get secret app-secrets -n library-management -o jsonpath='{.data.MONGODB_URI}' | base64 -d
```

Should output: `mongodb://admin:admin123@mongodb:27017/library_management?authSource=admin`

### Issue: High memory/CPU usage

**Solution:** Minikube default settings may be insufficient:
```powershell
minikube delete
minikube start --cpus=4 --memory=4096 --disk-size=30gb
```

### Issue: Services not accessible from host

**Solution:** Use port-forward or NodePort:
```powershell
kubectl port-forward svc/frontend 8080:8080 -n library-management
# Then access: http://localhost:8080
```

---

## Cleanup and Uninstall

### Delete Kubernetes Deployment Only

```powershell
kubectl delete namespace library-management
```

### Cleanup and Stop Minikube

```powershell
kubectl delete namespace library-management
minikube stop
```

### Delete Minikube Completely

```powershell
minikube delete
```

---

## Docker Images Information

### Backend Image Details
- Base Image: node:18-alpine
- Multi-stage build for optimization
- Includes health checks
- Uses non-root user for security
- Production dependencies only

### Frontend Image Details
- Base Image: node:18-alpine
- Multi-stage build
- Serves static files via http-server
- CORS enabled for API communication
- Optimized for lightweight deployment

---

## Environment Variables

### Backend Environment Variables
```
NODE_ENV: production
PORT: 5000
MONGODB_URI: mongodb://admin:admin123@mongodb:27017/library_management?authSource=admin
```

### MongoDB Environment Variables
```
MONGO_INITDB_ROOT_USERNAME: admin
MONGO_INITDB_ROOT_PASSWORD: admin123
MONGO_INITDB_DATABASE: library_management
```

---

## API Endpoints

### Health Check
- **GET** `/api/health` - Returns backend status

### Students
- **GET** `/api/students` - List all students
- **POST** `/api/students` - Create new student
- **GET** `/api/students/:id` - Get student details
- **PUT** `/api/students/:id` - Update student
- **DELETE** `/api/students/:id` - Delete student

### Books
- **GET** `/api/books` - List all books
- **POST** `/api/books` - Create new book (admin)
- **GET** `/api/books/:id` - Get book details
- **PUT** `/api/books/:id` - Update book (admin)
- **DELETE** `/api/books/:id` - Delete book (admin)

### Requests
- **GET** `/api/requests` - List requests
- **POST** `/api/requests` - Create book request
- **GET** `/api/requests/:id` - Get request details
- **PUT** `/api/requests/:id` - Update request (admin)
- **DELETE** `/api/requests/:id` - Delete request

### Admin
- **POST** `/api/admin/login` - Admin login
- **POST** `/api/admin/logout` - Admin logout

---

## Performance Metrics

Monitor application performance:

```powershell
# Get resource usage
kubectl top nodes -n library-management
kubectl top pods -n library-management
```

---

## Production Considerations

For production deployment:

1. **Registry**: Use Docker Hub or private registry instead of local images
2. **ImagePullPolicy**: Change from "Never" to "IfNotPresent"
3. **Replicas**: Increase replicas for high availability
4. **Storage**: Use persistent volume provisioner
5. **Security**: Implement network policies and RBAC
6. **Monitoring**: Add Prometheus and Grafana
7. **Logging**: Implement ELK stack for centralized logging
8. **Ingress**: Configure proper ingress with TLS/SSL

---

## Additional Resources

- [Minikube Documentation](https://minikube.sigs.k8s.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Express.js Documentation](https://expressjs.com/)

---

## Support

For issues or questions, please check:
1. Pod logs: `kubectl logs -n library-management -l app=<service>`
2. Pod events: `kubectl describe pod -n library-management <pod-name>`
3. Service connectivity: `kubectl get svc -n library-management`
4. Local Docker tests: `docker-compose up` and monitor output

---

**Last Updated**: January 7, 2026
**Project**: Library Management System - DevOps Deployment
