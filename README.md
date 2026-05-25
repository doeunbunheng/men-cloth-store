# Cloth Store

Cloth Store is a full-stack clothing store management system with a Django REST backend and a React + Vite frontend. It supports public product browsing, customer ordering, sale staff workflows, and admin management tools.

## Features

- Public product catalog
- Customer registration and login
- Role-based access for `Customer`, `Sale`, and `Admin`
- Product and variant management
- Order creation and order status updates
- Customer search for sales and admin users
- Sales log viewing
- Database backup export as SQL or JSON
- Product image upload support

## Tech Stack

- Backend: Django, Django REST Framework, Simple JWT, CORS Headers
- Frontend: React, Vite, React Router, Axios
- Database layer: Oracle through `python-oracledb`
- Media storage: local file uploads in `backend/media/`

## Project Structure

- `backend/` - Django project and API
- `backend/store/` - application logic, views, and database helpers
- `frontend/` - React client
- `Cloth Store.sql` - database script for the store schema and data

## Requirements

- Python 3.10+ recommended
- Node.js 18+ recommended
- Oracle Database or Oracle XE available at `localhost:1521/xepdb1`
- `npm` for the frontend

## Setup

### 1. Backend

Create and activate a Python virtual environment, then install the backend dependencies:

```bash
cd backend
pip install -r requirements.txt
```

Before running the backend, check `backend/mens_store/settings.py` and update the Oracle connection details if needed:

- `ORACLE_CONFIG['user']`
- `ORACLE_CONFIG['password']`
- `ORACLE_CONFIG['dsn']`

The app currently uses `python-oracledb` in `backend/store/utils.py` for data access.

Run migrations if your environment needs them, then start the API server:

```bash
python manage.py migrate
python manage.py runserver 8000
```

### 2. Frontend

Install frontend dependencies and start the Vite dev server:

```bash
cd ../frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` and proxies API requests to `http://localhost:8000`.

## How It Works

- Public users can browse products and register an account.
- Customers can log in and view their orders.
- Sale users can manage sales workflows and create orders.
- Admin users can manage products, variants, users, backups, and sales logs.

## API Overview

The backend API is served under `/api/` and includes routes for:

- Authentication: `/api/login/`, `/api/register/`, `/api/me/`
- Products and variants: `/api/products/`, `/api/products/<id>/variants/`, `/api/variants/<id>/`
- Orders: `/api/orders/`, `/api/orders/<id>/status/`, `/api/orders/<id>/items/`
- Admin tools: `/api/users/`, `/api/sales-log/`, `/api/backup/`
- Customer search: `/api/customers/search/`

## Notes

- Uploaded product images are stored in `backend/media/products/`.
- JWT tokens are stored in the browser `localStorage` by the frontend.
- The current codebase contains a hardcoded Oracle password in `settings.py`; update it before sharing or deploying the project.

