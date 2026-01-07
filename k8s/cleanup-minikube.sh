#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Library Management System - Cleanup ===${NC}\n"

# Delete all resources from the namespace
echo -e "${YELLOW}Deleting all resources...${NC}"
kubectl delete namespace library-management --ignore-not-found

echo -e "${GREEN}✓ All resources cleaned up${NC}\n"

# Optional: Stop and delete minikube
read -p "Do you want to stop minikube? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Stopping minikube...${NC}"
    minikube stop
    echo -e "${GREEN}✓ Minikube stopped${NC}"
fi

read -p "Do you want to delete minikube? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deleting minikube...${NC}"
    minikube delete
    echo -e "${GREEN}✓ Minikube deleted${NC}"
fi
