# 3-Tier MERN Application — Kubernetes Deployment

Complete end-to-end guide for deploying a MERN (MongoDB, Express, React, Node.js) stack application on Kubernetes with Ingress.


### 🛠️ Prerequisites

1. Required Tools

| Tool           | Installation Link                                                   |
| -------------- | ------------------------------------------------------------------- |
| Docker         | Refer the documnet [here](https://docs.docker.com/engine/install/)  |
| Kubernetes     | Refer the documnet [here](https://kubernetes.io/docs/setup/)        |
| kubectl        | Refer the documnet [here](https://kubernetes.io/docs/tasks/tools/)  |
| Git            | Refer the documnet [here](https://git-scm.com/downloads)            |

2. Kubernetes Cluster Options
**Choose one:**
- **Minikube:** Local development - Refer the documnet [here](https://minikube.sigs.k8s.io/docs/start/)
- **Kind:** Kubernetes in Docker -  Refer the documnet [here](https://kind.sigs.k8s.io/)
- **Docker Desktop:** Built-in K8s (Enable in Settings)
- **Cloud:** AWS EKS, GCP GKE, Azure AKS

3. System Requirements
- **CPU:** 4 cores minimum (8 cores recommended)
- **RAM:** 8GB minimum (16GB recommended)
- **Disk:** 50GB free space
- **OS:** Linux, macOS, or Windows with WSL2


### Architect Diagram



### 🧪 Local Testing (Before Kubernetes)

**Step-1:** Clone Repository
```sh
git clone <git-repo-url>
cd mern-k8s-app
```

**Step-2:** Docker Compose Setup
```sh
# Build and start all services
docker compose up --build -d

# Verify containers are running
docker compose ps
```

**Step 3:** Test Application
```sh
# Frontend (React UI)
http://localhost:3000

# Backend health check
curl http://localhost:8080/ok

# Create a task (optional)
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"task":"Deploy to Kubernetes","completed":false}'

# Get all tasks
curl http://localhost:8080/api/tasks
```

**Step 4:** Cleanup
```sh
# Stop and remove containers + volumes
docker compose down -v
```

### 🚀 Kubernetes Deployment

**Step-1:** Verify Kubernetes Cluster
```sh
# Check cluster status
kubectl cluster-info
kubectl get nodes

# Expected output: Node(s) in Ready state
```

**Step-2:** Create Namespace
```sh
kubectl apply -f k8s_manifests/namespace.yaml

# Verify
kubectl get ns todo-lab
```

**Step-3:** Deploy Database Layer (MongoDB)
```sh
# Apply database manifests
kubectl apply -f k8s_manifests/database/

# Wait for MongoDB to be ready (Important!)
kubectl wait --for=condition=ready pod/mongodb-0 -n todo-lab --timeout=120s

# Verify StatefulSet and PVC
kubectl get statefulset -n todo-lab
kubectl get pvc -n todo-lab

# Check MongoDB logs
kubectl logs mongodb-0 -n todo-lab | grep "Waiting for connections"
```
⏳ Wait Time: ~30-60 seconds for MongoDB initialization with authentication.


**Step-4:** Deploy Backend Layer (Node.js/Express)
```sh
# Apply backend manifests
kubectl apply -f k8s_manifests/backend/

# Wait for deployment rollout
kubectl rollout status deployment/backend -n todo-lab

# Verify pods are running
kubectl get pods -n todo-lab -l app=todo-backend

# Check backend logs
kubectl logs -f deployment/backend -n todo-lab
# Expected: "Connected to MongoDB successfully!"
#           "Server listening on port 8080..."
```

![database-connection](/assets/images/connection-verify.png)


**Step-5:** Deploy Frontend Layer (React/NGINX)
```sh
# Apply frontend manifests
kubectl apply -f k8s_manifests/frontend/

# Wait for deployment
kubectl rollout status deployment/frontend -n todo-lab

# Verify
kubectl get pods -n todo-lab -l app=frontend
```

**Step-6:** Verify All Resources
```sh
# Check all resources in namespace
kubectl get all -n todo-lab

# Check persistent volumes
kubectl get pvc -n todo-lab

# Check endpoints
kubectl get ep -n todo-lab
```

![deployment](/assets/images/deployment-verify.png)


### 🌐 Expose Application with Ingress

**Option-A: NGINX Ingress Controller**(Recommended)
1. Install NGINX Ingress Controller
```sh
# Apply NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.13.3/deploy/static/provider/cloud/deploy.yaml

# Verify installation
kubectl get pods -n ingress-nginx
```

2. Add Host Entry (Local Machine)
- Linux/Mac: Edit `/etc/hosts`
```sh
sudo vi /etc/hosts

# Add this line:
127.0.0.1   todo.local
```
- Windows: Edit `C:\Windows\System32\drivers\etc\hosts` (as Administrator)

3. Access Application
```sh
# Open browser
http://todo.local
```

**Option-B: NodePort (Quick Testing)**
```sh
# Patch frontend service to NodePort
kubectl patch service frontend-service -n todo-lab -p '{"spec":{"type":"NodePort","ports":[{"port":80,"nodePort":30080}]}}'

# Get node IP
kubectl get nodes -o wide

# Access application
http://<NODE-IP>:30080

# OR for local clusters:
http://localhost:30080
```

**Option-C: Port Forwarding (Development)**
```sh
# Forward frontend service to local port
kubectl port-forward svc/frontend-service 8080:80 -n todo-lab

# Access application
http://localhost:8080

# For Ingress

kubectl port-forward -n ingress-nginx service/ingress-nginx-controller 8085:80

# Access application
http://localhost:8085
```

![access](/assets/images/browsing-verify.png)



### ✅ Verification & Testing

1. Health Checks
```sh
# Test frontend
curl http://todo.local  # or http://localhost:30080

# Test backend health endpoint
kubectl port-forward svc/backend-svc 8080:8080 -n todo-lab
curl http://localhost:8080/ok
# Expected: {"status":"ok","database":"connected"}

# Test MongoDB authentication
kubectl exec -it mongodb-0 -n todo-lab -- \
  mongosh -u admin -p password123 --authenticationDatabase admin \
  --eval "db.adminCommand('ping')"
# Expected: { ok: 1 }
```

2. Functional Testing
```sh
# Create a task via API
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"task":"Test Kubernetes deployment","completed":false}'

# Get all tasks
curl http://localhost:8080/api/tasks

# Or test from frontend pod
kubectl exec -it deployment/frontend -n todo-lab -- \
  curl http://backend-svc:8080/api/tasks
```

3. Check Logs
```sh
# Frontend logs
kubectl logs -f deployment/frontend -n todo-lab

# Backend logs
kubectl logs -f deployment/backend -n todo-lab

# MongoDB logs
kubectl logs -f mongodb-0 -n todo-lab

# Ingress controller logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```


### 🔧 Debug Commands

1. Frontend Issues
```sh
# Check if ConfigMap loaded properly
kubectl describe configmap frontend-nginx-config -n todo-lab

# Verify NGINX config inside pod
kubectl exec -it deployment/frontend -n todo-lab -- cat /etc/nginx/conf.d/default.conf

# Test NGINX syntax
kubectl exec -it deployment/frontend -n todo-lab -- nginx -t

# Test backend connectivity from frontend pod
kubectl exec -it deployment/frontend -n todo-lab -- \
  curl http://backend-svc.todo-lab.svc.cluster.local:8080/ok
```

2. Backend Issues
```sh
# Check environment variables
kubectl exec deployment/backend -n todo-lab -- env | grep MONGO

# Test MongoDB connection from backend pod
kubectl exec -it deployment/backend -n todo-lab -- sh
# Inside pod:
# mongosh mongodb://mongodb-service:27017/todo -u admin -p password123 --authenticationDatabase admin
```

3. Database Issues
```sh
# Check PVC status
kubectl describe pvc mongodb-storage-mongodb-0 -n todo-lab

# Verify data persistence
kubectl exec -it mongodb-0 -n todo-lab -- ls -la /data/db/

# Access MongoDB shell
kubectl exec -it mongodb-0 -n todo-lab -- \
  mongosh -u admin -p password123 --authenticationDatabase admin

# Inside mongosh:
show dbs
use todo
db.tasks.find()
```

4. Network Debugging
```sh
# Test DNS resolution
kubectl run test-pod --image=busybox -n todo-lab -it --rm -- nslookup backend-svc.todo-lab.svc.cluster.local

# Test service connectivity
kubectl run test-pod --image=curlimages/curl -n todo-lab -it --rm -- \
  curl http://backend-svc:8080/ok

# Check service endpoints
kubectl get endpoints -n todo-lab
```


### 🗑️ Cleanup

1. Delete Application
```sh
# Delete all resources in namespace
kubectl delete namespace todo-lab

# Or delete selectively
kubectl delete -f k8s_manifests/frontend/
kubectl delete -f k8s_manifests/backend/
kubectl delete -f k8s_manifests/database/
kubectl delete -f k8s_manifests/namespace.yaml
```

2. Delete Ingress Controller
```sh
kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.13.3/deploy/static/provider/cloud/deploy.yaml
```

3. Reset PVCs (Fresh Database)
```sh
# Delete StatefulSet without cascading deletion
kubectl delete statefulset mongodb -n todo-lab --cascade=orphan

# Delete PVC
kubectl delete pvc mongodb-storage-mongodb-0 -n todo-lab

# Redeploy StatefulSet
kubectl apply -f k8s_manifests/database/statefulset.yaml
```


### 📝 Notes

- Default credentials: admin / password123 (Change in production!)
- Database persists data in PVC - survives pod restarts
- Backend uses StatefulSet for stable network identity
- Frontend uses ConfigMap for NGINX configuration
- All services use ClusterIP (internal) except Ingress


### 📚 References

- [Kubernetes Official Docs](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [MongoDB on Kubernetes](https://www.mongodb.com/kubernetes)
- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)