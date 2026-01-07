# Library Management System - Minikube Deployment Script for Windows PowerShell
# Run from the root directory of the project

param(
    [switch]$SkipDockerBuild = $false,
    [switch]$SkipMinikubeStart = $false,
    [string]$MinikubeCpus = "4",
    [string]$MinikubeMemory = "4096",
    [string]$MinikubeDiskSize = "20gb"
)

# Define colors for output
$ErrorColor = "Red"
$SuccessColor = "Green"
$WarningColor = "Yellow"
$InfoColor = "Cyan"

function Write-ColorOutput {
    param($Message, $Color)
    Write-Host $Message -ForegroundColor $Color
}

function Write-Success {
    Write-ColorOutput "✓ $args" $SuccessColor
}

function Write-Error-Custom {
    Write-ColorOutput "✗ $args" $ErrorColor
}

function Write-Warning-Custom {
    Write-ColorOutput "⚠ $args" $WarningColor
}

function Write-Info {
    Write-ColorOutput "ℹ $args" $InfoColor
}

# Check prerequisites
Write-ColorOutput "`n=== Library Management System - Minikube Deployment ===" $WarningColor
Write-Info "Checking prerequisites..."

$missingTools = @()

# Check Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    $missingTools += "Docker"
}
else {
    Write-Success "Docker found"
}

# Check Minikube
if (-not (Get-Command minikube -ErrorAction SilentlyContinue)) {
    $missingTools += "Minikube"
}
else {
    Write-Success "Minikube found"
}

# Check kubectl
if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
    $missingTools += "kubectl"
}
else {
    Write-Success "kubectl found"
}

if ($missingTools.Count -gt 0) {
    Write-Error-Custom "Missing tools: $($missingTools -join ', ')"
    Write-ColorOutput "`nPlease install the missing tools and try again." $WarningColor
    exit 1
}

Write-Success "All prerequisites met`n"

# Start Minikube
if (-not $SkipMinikubeStart) {
    Write-ColorOutput "Starting Minikube..." $WarningColor
    try {
        $status = minikube status 2>&1
        if ($status -like "*Running*") {
            Write-ColorOutput "Minikube is already running" $WarningColor
        }
        else {
            minikube start --cpus=$MinikubeCpus --memory=$MinikubeMemory --disk-size=$MinikubeDiskSize
            if ($LASTEXITCODE -ne 0) {
                throw "Failed to start Minikube"
            }
            Write-Success "Minikube started successfully"
        }
    }
    catch {
        Write-Error-Custom "Failed to start Minikube: $_"
        exit 1
    }
}
else {
    Write-Info "Skipping Minikube start (--SkipMinikubeStart flag set)"
}

# Enable addons
Write-ColorOutput "Enabling Minikube addons..." $WarningColor
minikube addons enable metrics-server 2>&1 | Out-Null
Write-Success "metrics-server enabled"

minikube addons enable ingress 2>&1 | Out-Null
Write-Success "ingress enabled`n"

# Setup Docker environment to use Minikube's daemon
Write-ColorOutput "Configuring Docker to use Minikube's Docker daemon..." $WarningColor
try {
    & minikube docker-env | Invoke-Expression
    Write-Success "Docker environment configured`n"
}
catch {
    Write-Warning-Custom "Failed to configure Docker environment: $_"
}

# Build Docker images
if (-not $SkipDockerBuild) {
    Write-ColorOutput "Building Docker images..." $WarningColor
    
    # Build backend
    Write-Info "Building backend image..."
    docker build -t library-backend:latest ./backend
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to build backend image"
        exit 1
    }
    Write-Success "Backend image built successfully"
    
    # Build frontend
    Write-Info "Building frontend image..."
    docker build -t library-frontend:latest ./frontend
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to build frontend image"
        exit 1
    }
    Write-Success "Frontend image built successfully`n"
}
else {
    Write-Info "Skipping Docker build (--SkipDockerBuild flag set)`n"
}

# Create namespace
Write-ColorOutput "Creating Kubernetes namespace..." $WarningColor
kubectl create namespace library-management --dry-run=client -o yaml | kubectl apply -f - 2>&1 | Out-Null
Write-Success "Namespace created`n"

# Apply configurations
Write-ColorOutput "Applying Kubernetes configurations..." $WarningColor

Write-Info "Applying ConfigMap..."
kubectl apply -f ./k8s/configmap.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Failed to apply ConfigMap"
    exit 1
}
Write-Success "ConfigMap applied"

Write-Info "Applying Secrets..."
kubectl apply -f ./k8s/secret.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Failed to apply Secrets"
    exit 1
}
Write-Success "Secrets applied`n"

# Deploy MongoDB
Write-ColorOutput "Deploying MongoDB..." $WarningColor
kubectl apply -f ./k8s/mongodb.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Failed to deploy MongoDB"
    exit 1
}
Write-Success "MongoDB deployment submitted"

Write-Info "Waiting for MongoDB to be ready (this may take a minute)..."
$mongoReady = $false
$attempts = 0
$maxAttempts = 60

while (-not $mongoReady -and $attempts -lt $maxAttempts) {
    $podStatus = kubectl get pod -n library-management -l app=mongodb -o jsonpath='{.items[0].status.conditions[?(@.type=="Ready")].status}' 2>&1
    if ($podStatus -eq "True") {
        $mongoReady = $true
        Write-Success "MongoDB is ready"
    }
    else {
        $attempts++
        Start-Sleep -Seconds 2
        Write-Host -NoNewline "."
    }
}

if (-not $mongoReady) {
    Write-Warning-Custom "MongoDB is taking longer than expected to start. Continuing anyway..."
}
Write-Host ""

# Deploy Backend
Write-ColorOutput "Deploying Backend..." $WarningColor
kubectl apply -f ./k8s/backend.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Failed to deploy Backend"
    exit 1
}
Write-Success "Backend deployment submitted"

Write-Info "Waiting for Backend to be ready (this may take a minute)..."
$backendReady = $false
$attempts = 0

while (-not $backendReady -and $attempts -lt $maxAttempts) {
    $podStatus = kubectl get pod -n library-management -l app=backend -o jsonpath='{.items[0].status.conditions[?(@.type=="Ready")].status}' 2>&1
    if ($podStatus -eq "True") {
        $backendReady = $true
        Write-Success "Backend is ready"
    }
    else {
        $attempts++
        Start-Sleep -Seconds 2
        Write-Host -NoNewline "."
    }
}

if (-not $backendReady) {
    Write-Warning-Custom "Backend is taking longer than expected to start. Continuing anyway..."
}
Write-Host ""

# Deploy Frontend
Write-ColorOutput "Deploying Frontend..." $WarningColor
kubectl apply -f ./k8s/frontend.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Failed to deploy Frontend"
    exit 1
}
Write-Success "Frontend deployment submitted"

Write-Info "Waiting for Frontend to be ready (this may take a minute)..."
$frontendReady = $false
$attempts = 0

while (-not $frontendReady -and $attempts -lt $maxAttempts) {
    $podStatus = kubectl get pod -n library-management -l app=frontend -o jsonpath='{.items[0].status.conditions[?(@.type=="Ready")].status}' 2>&1
    if ($podStatus -eq "True") {
        $frontendReady = $true
        Write-Success "Frontend is ready"
    }
    else {
        $attempts++
        Start-Sleep -Seconds 2
        Write-Host -NoNewline "."
    }
}

if (-not $frontendReady) {
    Write-Warning-Custom "Frontend is taking longer than expected to start. Continuing anyway..."
}
Write-Host ""

# Patch services to NodePort (optional but useful)
Write-ColorOutput "Configuring services..." $WarningColor
kubectl patch service backend -n library-management -p '{"spec":{"type":"NodePort"}}' 2>&1 | Out-Null
kubectl patch service frontend -n library-management -p '{"spec":{"type":"NodePort"}}' 2>&1 | Out-Null
Write-Success "Services configured`n"

# Get access information
Write-ColorOutput "`n=== Deployment Complete ===" $SuccessColor

$MinikubeIP = minikube ip
$BackendPort = kubectl get service backend -n library-management -o jsonpath='{.spec.ports[0].nodePort}' 2>&1
$FrontendPort = kubectl get service frontend -n library-management -o jsonpath='{.spec.ports[0].nodePort}' 2>&1

Write-ColorOutput "`nService URLs:" $SuccessColor
Write-ColorOutput "  Backend API:   http://$MinikubeIP`:$BackendPort" $InfoColor
Write-ColorOutput "  Frontend:      http://$MinikubeIP`:$FrontendPort" $InfoColor

Write-ColorOutput "`nDefault Login Credentials:" $SuccessColor
Write-ColorOutput "  Email:    admin@library.com" $InfoColor
Write-ColorOutput "  Password: admin123" $InfoColor

Write-ColorOutput "`nUseful Commands:" $SuccessColor
Write-ColorOutput "  View resources:          kubectl get all -n library-management" $InfoColor
Write-ColorOutput "  View pod logs:           kubectl logs -n library-management -l app=backend" $InfoColor
Write-ColorOutput "  Port forward backend:    kubectl port-forward -n library-management svc/backend 5000:5000" $InfoColor
Write-ColorOutput "  Port forward frontend:   kubectl port-forward -n library-management svc/frontend 8080:8080" $InfoColor
Write-ColorOutput "  Open dashboard:          minikube dashboard" $InfoColor
Write-ColorOutput "  SSH into minikube:       minikube ssh" $InfoColor

Write-ColorOutput "`nAccess Application:" $SuccessColor
Write-ColorOutput "  Option 1 - Using NodePort (above URLs)" $InfoColor
Write-ColorOutput "  Option 2 - Port Forward:" $InfoColor
Write-ColorOutput "    kubectl port-forward svc/frontend 8080:8080 -n library-management" $InfoColor
Write-ColorOutput "    Then open: http://localhost:8080" $InfoColor
Write-ColorOutput "  Option 3 - Minikube Service:" $InfoColor
Write-ColorOutput "    minikube service frontend -n library-management" $InfoColor

Write-Success "`nLibrary Management System is ready for use!`n"
