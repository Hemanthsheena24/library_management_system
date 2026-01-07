#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Library Management System - Minikube Deployment ===${NC}\n"

# Check if minikube is installed
if ! command -v minikube &> /dev/null; then
    echo -e "${RED}Error: minikube is not installed${NC}"
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed${NC}"
    exit 1
fi

# Start minikube
echo -e "${YELLOW}Starting minikube...${NC}"
minikube start --cpus=4 --memory=4096 --disk-size=20gb

# Enable metrics-server for better monitoring
echo -e "${YELLOW}Enabling metrics-server addon...${NC}"
minikube addons enable metrics-server

# Enable ingress controller
echo -e "${YELLOW}Enabling ingress addon...${NC}"
minikube addons enable ingress

# Build Docker images with minikube's Docker daemon
echo -e "${YELLOW}Setting up minikube Docker environment...${NC}"
eval $(minikube docker-env)

# Build backend image
echo -e "${YELLOW}Building backend Docker image...${NC}"
docker build -t library-backend:latest ./backend
if [ $? -ne 0 ]; then
    echo -e "${RED}Error building backend image${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend image built successfully${NC}\n"

# Build frontend image
echo -e "${YELLOW}Building frontend Docker image...${NC}"
docker build -t library-frontend:latest ./frontend
if [ $? -ne 0 ]; then
    echo -e "${RED}Error building frontend image${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend image built successfully${NC}\n"

# Create namespace
echo -e "${YELLOW}Creating namespace...${NC}"
kubectl create namespace library-management --dry-run=client -o yaml | kubectl apply -f -

# Apply ConfigMap
echo -e "${YELLOW}Applying ConfigMap...${NC}"
kubectl apply -f ./k8s/configmap.yaml
if [ $? -ne 0 ]; then
    echo -e "${RED}Error applying ConfigMap${NC}"
    exit 1
fi
echo -e "${GREEN}✓ ConfigMap created${NC}\n"

# Apply Secrets
echo -e "${YELLOW}Applying Secrets...${NC}"
kubectl apply -f ./k8s/secret.yaml
if [ $? -ne 0 ]; then
    echo -e "${RED}Error applying Secrets${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Secrets created${NC}\n"

# Apply MongoDB
echo -e "${YELLOW}Applying MongoDB...${NC}"
kubectl apply -f ./k8s/mongodb.yaml
if [ $? -ne 0 ]; then
    echo -e "${RED}Error applying MongoDB${NC}"
    exit 1
fi
echo -e "${GREEN}✓ MongoDB deployed${NC}\n"

# Wait for MongoDB to be ready
echo -e "${YELLOW}Waiting for MongoDB to be ready...${NC}"
kubectl rollout status statefulset/mongodb -n library-management --timeout=5m
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}MongoDB is taking longer to start. Continuing...${NC}"
fi

# Apply Backend
echo -e "${YELLOW}Applying Backend...${NC}"
kubectl apply -f ./k8s/backend.yaml
if [ $? -ne 0 ]; then
    echo -e "${RED}Error applying Backend${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend deployed${NC}\n"

# Wait for Backend to be ready
echo -e "${YELLOW}Waiting for Backend to be ready...${NC}"
kubectl rollout status deployment/backend -n library-management --timeout=5m
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Backend is taking longer to start. Continuing...${NC}"
fi

# Apply Frontend
echo -e "${YELLOW}Applying Frontend...${NC}"
kubectl apply -f ./k8s/frontend.yaml
if [ $? -ne 0 ]; then
    echo -e "${RED}Error applying Frontend${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend deployed${NC}\n"

# Wait for Frontend to be ready
echo -e "${YELLOW}Waiting for Frontend to be ready...${NC}"
kubectl rollout status deployment/frontend -n library-management --timeout=5m
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Frontend is taking longer to start. Continuing...${NC}"
fi

# Create NodePort services for easier access
echo -e "${YELLOW}Creating NodePort services...${NC}"
kubectl patch service backend -n library-management -p '{"spec":{"type":"NodePort"}}'
kubectl patch service frontend -n library-management -p '{"spec":{"type":"NodePort"}}'

# Get minikube IP
MINIKUBE_IP=$(minikube ip)

# Get service ports
BACKEND_PORT=$(kubectl get service backend -n library-management -o jsonpath='{.spec.ports[0].nodePort}')
FRONTEND_PORT=$(kubectl get service frontend -n library-management -o jsonpath='{.spec.ports[0].nodePort}')

echo -e "${GREEN}=== Deployment Complete ===${NC}\n"
echo -e "${GREEN}Service URLs:${NC}"
echo -e "  Backend API:   http://${MINIKUBE_IP}:${BACKEND_PORT}"
echo -e "  Frontend:      http://${MINIKUBE_IP}:${FRONTEND_PORT}\n"

echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  View all resources:     kubectl get all -n library-management"
echo -e "  View pod logs:          kubectl logs -n library-management -l app=backend"
echo -e "  Port forward backend:   kubectl port-forward -n library-management svc/backend 5000:5000"
echo -e "  Port forward frontend:  kubectl port-forward -n library-management svc/frontend 8080:8080"
echo -e "  Access minikube shell:  minikube ssh"
echo -e "  Dashboard:              minikube dashboard\n"

echo -e "${GREEN}✓ Library Management System is ready!${NC}"
