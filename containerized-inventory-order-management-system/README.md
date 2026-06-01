# Orderio — Inventory & Order Management System

A production-ready, fully containerized full-stack Inventory & Order Management System built with **FastAPI**, **React**, **PostgreSQL**, and orchestrated with **Docker Compose**.

---

## 📋 Features

- 📦 **Product Management** — Create, read, update, and delete products with SKU tracking
- 👥 **Customer Management** — Manage customer profiles with unique email enforcement
- 🛒 **Order Management** — Create multi-item orders with automatic stock deduction
- 📊 **Dashboard** — Real-time summary with low-stock alerts
- 🔒 **Business Logic** — Stock validation, atomic transactions, backend price calculation
- 🐳 **Fully Containerized** — One command to run everything

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, Uvicorn |
| ORM | SQLAlchemy 2.x |
| Validation | Pydantic v2 |
| Database | PostgreSQL 15 |
| Frontend | React 18, Vite, React Router v6 |
| HTTP Client | Axios |
| Containerization | Docker + Docker Compose |

---

## 📁 Folder Structure

```
containerized-inventory-order-management-system/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, startup
│   │   ├── database.py      # SQLAlchemy engine & session
│   │   ├── models.py        # ORM models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── crud.py          # Business logic & DB operations
│   │   └── routers/
│   │       ├── products.py
│   │       ├── customers.py
│   │       ├── orders.py
│   │       └── dashboard.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── api/api.js       # Axios API client
│   │   ├── components/      # Navbar, Message, Loading
│   │   ├── pages/           # Dashboard, Products, Customers, Orders, OrderDetails
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🌐 API Endpoints

### Products
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/products` | List all products |
| `POST` | `/products` | Create a product |
| `GET` | `/products/{id}` | Get product by ID |
| `PUT` | `/products/{id}` | Update a product |
| `DELETE` | `/products/{id}` | Delete a product |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/customers` | List all customers |
| `POST` | `/customers` | Create a customer |
| `GET` | `/customers/{id}` | Get customer by ID |
| `DELETE` | `/customers/{id}` | Delete a customer |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/orders` | List all orders |
| `POST` | `/orders` | Create an order |
| `GET` | `/orders/{id}` | Get order with line items |
| `DELETE` | `/orders/{id}` | Cancel/delete an order |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/summary` | Get summary metrics |

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` before running:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `POSTGRES_USER` | PostgreSQL username | `inventory_user` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `inventory_password` |
| `POSTGRES_DB` | PostgreSQL database name | `inventory_db` |
| `DATABASE_URL` | Full DB connection string for backend | see example |
| `VITE_API_URL` | Browser-accessible backend URL | `http://localhost:8000` |

---

## 🚀 Running with Docker Compose (Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Steps

```bash
# 1. Clone / navigate to the project
cd containerized-inventory-order-management-system

# 2. Set up environment variables
cp .env.example .env

# 3. Build and start all services
docker compose up --build

# 4. Open your browser
#    Frontend:  http://localhost:3000
#    API Docs:  http://localhost:8000/docs
```

To stop all services:
```bash
docker compose down
```

To stop and remove all data (including the database):
```bash
docker compose down -v
```

---

## 🔧 Running Services Separately (Development)

### Backend

```bash
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate      # macOS/Linux
venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variable (point to a local or Docker PostgreSQL)
export DATABASE_URL=postgresql://inventory_user:inventory_password@localhost:5432/inventory_db

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set the backend URL
# Create a .env file with:
echo "VITE_API_URL=http://localhost:8000" > .env

# Run the dev server
npm run dev
```

The frontend dev server will start at `http://localhost:5173`.

---

## 📖 FastAPI Interactive Docs

Once the backend is running, the full interactive API documentation is available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🧪 Testing the Main Features

### Quick Test Flow

1. **Open the app** → http://localhost:3000
2. **Create a product**: Go to Products → Add Product → fill in name, SKU, price, quantity
3. **Create a customer**: Go to Customers → Add Customer → fill in name, email
4. **Create an order**: Go to Orders → New Order → select customer, add product with quantity → Place Order
5. **Verify stock reduced**: Go back to Products → confirm quantity decreased
6. **Test insufficient stock**: Try creating another order for more than available stock — you'll see an error
7. **Check dashboard**: Go to Dashboard — all counts update in real-time

---

## 🔍 Troubleshooting

### Backend can't connect to the database
- Ensure Docker Desktop is running
- Wait 10–15 seconds after `docker compose up` for PostgreSQL to fully initialize
- The backend has a built-in retry mechanism (10 retries × 3 seconds)

### Frontend shows "Failed to load" errors
- Check the `VITE_API_URL` in your `.env` file points to `http://localhost:8000`
- Verify the backend container is running: `docker compose ps`
- Check backend logs: `docker compose logs backend`

### Port conflicts
If ports 3000, 8000, or 5432 are already in use:
```bash
# Change ports in docker-compose.yml
# For example, map backend to 8001:
ports:
  - "8001:8000"
```

### Database reset
```bash
docker compose down -v   # removes postgres_data volume
docker compose up --build
```

### View logs
```bash
docker compose logs -f           # All services
docker compose logs -f backend   # Backend only
docker compose logs -f db        # Database only
```

---

## 🚢 Deployment Notes

- **CORS**: Currently set to `allow_origins=["*"]`. Restrict this to your frontend domain in production.
- **Secrets**: Use Docker Secrets or a secrets manager (e.g., AWS Secrets Manager) instead of `.env` files in production.
- **Database**: Use a managed PostgreSQL service (e.g., AWS RDS, Supabase, Neon) for production.
- **Frontend**: Replace `nginx` serving with a CDN (e.g., Cloudflare, AWS CloudFront) for better performance.
- **SSL**: Add an SSL termination layer (e.g., Traefik, nginx with Let's Encrypt) in production.

---

## 📝 Assumptions

- No authentication is implemented (out of scope for this project)
- Order status can be: `pending`, `confirmed`, `cancelled`
- Cancelling/deleting an order automatically restores product stock
- Tables are created automatically via SQLAlchemy on first startup

---

Built with ❤️ for a software engineering technical assessment
