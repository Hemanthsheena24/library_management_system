#!/bin/bash

# Deploy to Kubernetes
echo "Creating namespace..."
kubectl apply -f namespace.yaml

echo "Creating secrets and configmaps..."
kubectl apply -f secret.yaml
kubectl apply -f configmap.yaml

echo "Deploying MongoDB..."
kubectl apply -f mongodb.yaml

echo "Deploying Backend..."
kubectl apply -f backend.yaml

echo "Deploying Frontend..."
kubectl apply -f frontend.yaml

echo "Setting up Ingress..."
kubectl apply -f ingress.yaml

echo "Waiting for deployments to be ready..."
kubectl rollout status deployment/backend -n library-management
kubectl rollout status deployment/frontend -n library-management

echo "Deployment complete!"
echo ""
echo "To access the application:"
echo "- Frontend: http://library.local"
echo "- Backend API: http://library.local/api"
echo ""
echo "To check status:"
echo "kubectl get pods -n library-management"
echo "kubectl get svc -n library-management"
