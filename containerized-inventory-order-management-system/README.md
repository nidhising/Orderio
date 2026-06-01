# Orderio — Inventory & Order Management System

A full-stack Inventory & Order Management System built with FastAPI, React, PostgreSQL, and Docker Compose.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, Uvicorn |
| ORM | SQLAlchemy 2.x |
| Validation | Pydantic v2 |
| Database | PostgreSQL 15 |
| Frontend | React 18, Vite, React Router v6 |
| HTTP Client | Axios |
| Containerization | Docker + Docker Compose |

## Features

- Product Management — Create, read, update, and delete products with SKU tracking
- Customer Management — Manage customer profiles with unique email enforcement
- Order Management — Create multi-item orders with automatic stock deduction
- Dashboard — Summary with low-stock alerts
- Business Logic — Stock validation, atomic transactions, backend price calculation
- Fully Containerized — Single command to run everything

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── crud.py
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
│   │   ├── api/api.js
│   │   ├── components/
│   │   ├── pages/
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

## API Endpoints

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

## Environment Variables

Copy `.env.example` to `.env` before running:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `POSTGRES_USER` | PostgreSQL username |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DB` | PostgreSQL database name |
| `DATABASE_URL` | Full DB connection string for backend |
| `VITE_API_URL` | Browser-accessible backend URL |

## Getting Started

### Prerequisites
- Docker Desktop installed and running

### Run with Docker Compose

```bash
# Navigate to the project directory
cd containerized-inventory-order-management-system

# Set up environment variables
cp .env.example .env

# Build and start all services
docker compose up --build
```

Once running:
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

### Stop Services

```bash
docker compose down

# Remove all data including the database
docker compose down -v
```

## Running Without Docker

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows

pip install -r requirements.txt

set DATABASE_URL=postgresql://inventory_user:inventory_password@localhost:5432/inventory_db
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

## Troubleshooting

**Backend can't connect to the database**
- Make sure Docker Desktop is running
- Wait 10-15 seconds after startup for PostgreSQL to initialize
- The backend retries the connection automatically (10 attempts)

**Frontend shows errors**
- Check that `VITE_API_URL` in `.env` points to `http://localhost:8000`
- Run `docker compose ps` to check container status
- Run `docker compose logs backend` to see backend output

**Port conflicts**
- Edit the `ports` section in `docker-compose.yml` to use different host ports

**Reset the database**
```bash
docker compose down -v
docker compose up --build
```

## Notes

- No authentication is implemented
- Order status: `pending`, `confirmed`, `cancelled`
- Cancelling an order restores product stock
- Tables are created automatically on first startup
