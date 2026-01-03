# <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/kubernetes/kubernetes-plain.svg" alt="Kubernetes" width="40"/> MERN Stack Todo App - Kubernetes Deployment


### 🎯 Overview
This project focuses on containerizing an **MERN** application and deploying it on **Kubernetes** with routing using **Ingress**.

It is designed to simulate real-world cloud deployment practices, covering:
- **Dockerizing** frontend and backend
- Running **MongoDB** with **persistent storage**
- Deploying the full stack on **Kubernetes**
- Using **ConfigMaps and Secrets**
- Exposing the app using **NGINX Ingress**
- Supporting local clusters (**Kind/Minikube**)

The goal is to provide a hands-on reference implementation for building and deploying **full-stack** application using **Kubernetes**.


### 🛠️ Prerequisites

| Tool        | Purpose                                                   | Documentation |
|-------------|-----------------------------------------------------------|---------------|
| **Node.js** | JavaScript runtime used to build and run the backend service | [Install Node.js](https://nodejs.org/en/download) |
| **npm**     | Package manager for installing and managing dependencies | [npm Documentation](https://docs.npmjs.com/) |
| **Docker & Docker Compose**  | Builds and runs container images for application services | [Install Docker](https://docs.docker.com/engine/install/) |
| **Kubectl CLI** | Used to interacting with the Kubernetes API server. | [Install Kubectl CLI](https://kubernetes.io/docs/tasks/tools/) |
| **KIND** *(or any Kubernetes tool)* | Used to deploy and test the application locally on Kubernetes | [Install Kind](https://kind.sigs.k8s.io/docs/user/quick-start/) |


### ⚙️ Architect Diagram
![architect](/assets/architect-diagram.png)


### 🧪 Local Testing (Docker Compose)
Before deploying to Kubernetes, verify the containerized application works locally.

**Step-1: Start the stack**
```sh
# Build and start all services
docker compose up --build -d

# Verify containers are running
docker compose ps

# Check logs
docker compose logs -f
```

**Step-2: Access the Application**
- Open `http://localhost:3000` in your browser.

**Step-3: Stop all the services**
```sh
# Stop and remove containers, networks & volumes
docker compose down -v
```

### 🚀 Kubernetes Deployment
Deploy the application to your Kubernetes cluster.

**Step-1: Create Namespace**
- Isolate resources in a dedicated namespace.
```sh
# Create namespace
kubectl apply -f k8s_manifests/namespace.yaml
```

**Step-2: Deploy Database (MongoDB)**
- Deploys MongoDB as a StatefulSet with Persistent Volume.
```sh
# Apply database manifests
kubectl apply -f k8s_manifests/database/

# Check MongoDb connectivity
kubectl exec -it mongodb-0 -n todo-lab -- mongosh -u admin -p password123 --authenticationDatabase admin
```
![database-connection](/assets/db-connection-verify.png)


**Step-3: Deploy Backend API**
- Deploys the Node.js API.
```sh
# Apply backend manifests
kubectl apply -f k8s_manifests/backend/

# Check backend logs
kubectl logs -f deployment/backend -n todo-lab
```
![backend-connection](/assets/connection-verify.png)


**Step-4: Deploy Frontend UI**
- Deploys the React App with Nginx and Ingress rules.
```sh
# Apply frontend manifests
kubectl apply -f k8s_manifests/frontend/
```

**Step-5: Verify All Resources**
```sh
# Check all resources in namespace
kubectl get all -n todo-lab

# Check persistent volumes
kubectl get pvc -n todo-lab

# Check endpoints
kubectl get ep -n todo-lab
```
![deployment](/assets/deployment-verify.png)


### 🌐 Expose Application with Ingress

1. Install NGINX Ingress Controller
```sh
# Apply NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.13.3/deploy/static/provider/cloud/deploy.yaml

# Verify installation
kubectl get pods -n ingress-nginx
```
![ingress](/assets/ingress.png)


3. Access the Application
- Get your cluster IP (or localhost if using Docker Desktop/Kind).
Open `http://<clusterip:80>` in your browser.

![access](/assets/browsing-verify.png)



### 🗑️ Cleanup

1. To remove all resources:
```sh
# Delete all resources in namespace
kubectl delete namespace todo-lab

# Or delete selectively
kubectl delete -f k8s_manifests/frontend/
kubectl delete -f k8s_manifests/backend/
kubectl delete -f k8s_manifests/database/
kubectl delete -f k8s_manifests/namespace.yaml

# Delete PVC
kubectl delete pvc mongodb-storage-mongodb-0 -n todo-lab
```

2. Delete Ingress Controller
```sh
kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.13.3/deploy/static/provider/cloud/deploy.yaml
```


### 🧾 Summary
This repository contains a **MERN** stack application deployed on **Kubernetes** with:
- React frontend
- Node.js / Express backend
- MongoDB database with persistent volume
- NGINX Ingress for traffic routing
- Kubernetes manifests for complete infrastructure setup


### 📚 References
- [Kubernetes Official Docs](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [MongoDB on Kubernetes](https://www.mongodb.com/kubernetes)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [KIND Guide](https://kind.sigs.k8s.io/)
- [Minikube Guide](https://minikube.sigs.k8s.io/docs/start/)
