#!/bin/bash

echo "Step 1: Building Docker images..."
cd ../backend
docker build -t library-backend:latest .
cd ../frontend
docker build -t library-frontend:latest .
cd ../k8s

echo ""
echo "Step 2: Installing NGINX Ingress Controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
sleep 30

echo ""
echo "Step 3: Deploying application..."
kubectl apply -f namespace.yaml
kubectl apply -f secret.yaml
kubectl apply -f configmap.yaml
kubectl apply -f mongodb.yaml
kubectl apply -f backend.yaml
kubectl apply -f frontend.yaml
kubectl apply -f ingress.yaml

echo ""
echo "Waiting for deployments to be ready..."
kubectl rollout status deployment/backend -n library-management
kubectl rollout status deployment/frontend -n library-management

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Access the application:"
echo "- Frontend: http://localhost (or http://library.local if you add to /etc/hosts)"
echo "- Backend API: http://localhost/api"
echo ""
echo "Check status:"
echo "kubectl get pods -n library-management"
echo "kubectl get svc -n library-management"
