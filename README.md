# ShopSphere — Full-Stack E-Commerce (React + Django REST API + JWT + MySQL)

A decoupled full-stack project, structured the way the example you shared
was: a separate `backend/` (Django REST Framework API) and `frontend/`
(React app), talking to each other over HTTP with JWT authentication.

## Architecture

- **Backend** — Django REST Framework, `djangorestframework-simplejwt` for
  JWT auth, `django-filter` for search/ordering, `django-cors-headers` so
  the React dev server (port 3000) can call the API (port 8000).
  - `accounts` — custom `User` model (email-unique + shipping fields),
    register/login/refresh/profile endpoints. Login embeds the user object
    in the response so the frontend doesn't need a second call.
  - `products` — Category & Product, slug-based lookups, public read,
    **admin-only write** (`IsAdminUser`, i.e. Django's `is_staff` flag).
  - `cart` — one cart per user, ownership-scoped (a user can never touch
    another user's cart, even by guessing an item id).
  - `orders` — checkout runs in **one atomic transaction**: check stock →
    create order → decrement stock → empty cart, all-or-nothing.
- **Frontend** — React 18 + React Router v6, Context API for auth/cart/
  toast state (`AuthContext`, `CartContext`, `ToastContext`), a shared
  `axios` instance that attaches the JWT to every request and silently
  refreshes it on a 401.
- **Database** — MySQL (configured for MySQL Workbench / WAMP on
  `localhost:3306`, user `root`). An SQLite fallback block is included in
  `backend/ecommerce_backend/settings.py`.

## Project layout

```
shopsphere/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── ecommerce_backend/   # settings (DRF, JWT, CORS, MySQL-ready), urls
│   ├── accounts/            # custom User, register/login/profile
│   ├── products/            # Category, Product, seed command
│   ├── cart/                # Cart, CartItem
│   └── orders/               # Order, OrderItem, checkout
└── frontend/
    ├── package.json
    ├── public/index.html
    └── src/
        ├── api/axios.js       # JWT-aware axios instance (auto-refresh)
        ├── context/            # AuthContext, CartContext, ToastContext
        ├── components/         # Navbar, ProductCard, Pagination, ProtectedRoute
        ├── pages/               # Home, ProductDetail, Cart, Checkout, Orders,
        │                          Profile, SignIn, SignUp, ManageProducts
        └── styles/App.css       # theme
```

## API endpoints

| Method | URL | Auth | Notes |
|---|---|---|---|
| POST | `/api/accounts/register/` | none | creates User (default auto id) |
| POST | `/api/accounts/login/` | none | returns `{access, refresh, user}` |
| POST | `/api/accounts/refresh/` | none | refresh → new access token |
| GET/PUT | `/api/accounts/profile/` | JWT | current user's own profile |
| GET | `/api/products/categories/` | none | list |
| GET | `/api/products/products/` | none | `?search=`, `?category=`, `?ordering=`, `?page=` |
| GET | `/api/products/products/<slug>/` | none | detail |
| POST/PUT/PATCH/DELETE | `/api/products/products/<slug>/` | JWT, `is_staff` | manage catalog |
| GET | `/api/cart/` | JWT | your own cart |
| POST | `/api/cart/add/` | JWT | `{product_id, quantity}` |
| PUT/DELETE | `/api/cart/items/<id>/` | JWT | change qty / remove |
| GET | `/api/orders/` | JWT | your own orders (staff sees all) |
| GET | `/api/orders/<id>/` | JWT | one order (yours, or any if staff) |
| POST | `/api/orders/checkout/` | JWT | cart → Order, atomic, stock-checked |

## Setup

### Backend
```bash
cd shopsphere/backend
python -m venv venv
source venv/bin/activate        # venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py seed              # adds 13 sample products so the shop isn't empty
python manage.py createsuperuser   # optional, for /admin/
python manage.py runserver
```
Backend runs at `http://127.0.0.1:8000/`.

### Frontend
In a second terminal:
```bash
cd shopsphere/frontend
npm install
npm start
```
Frontend runs at `http://localhost:3000/` and talks to the backend via CORS.

### Making yourself an admin (to manage products)
Every sign-up is a regular customer. To promote one to staff/admin:
```bash
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
u = User.objects.get(username='YOUR_USERNAME')
u.is_staff = True
u.save()
"
```
Sign out and back in afterwards (the JWT/localStorage user object needs to
be refetched), and the "Manage" link will appear in the navbar.

## MySQL setup (already configured in settings.py)

1. In MySQL Workbench, run:
   ```sql
   CREATE DATABASE shopsphere_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. `pip install mysqlclient`
3. `python manage.py migrate` then `python manage.py seed`
4. Check in Workbench: `USE shopsphere_db; SHOW TABLES;`

To run without MySQL, comment the MySQL `DATABASES` block and uncomment the
SQLite one below it.

## What was verified before shipping this

- `python manage.py check` — no issues
- Full backend flow via DRF's `APIClient`: register → login (correct
  `is_staff` claim) → non-admin blocked (403) from creating a product,
  admin allowed (201) → add to cart → checkout (stock correctly
  decremented, cart emptied) → a second user gets **404** on someone
  else's order, not a data leak → refresh token issues a new access
  token → garbage token and wrong password both rejected with 401
- Same flow re-verified over **real HTTP** (`curl` against the actual dev
  server), including CORS headers for `http://localhost:3000`
- `npm run build` on the React app — **compiled successfully**, no errors

## How this maps to your course notes

| Feature | Course file |
|---|---|
| Sessions/cookies background | `18_Sessions_Cookies_and_User_Tracking` |
| REST API design | `19_REST_Api` |
| JWT auth | `20_JWT_Authentication` |
| MySQL connection | `7_MySQL_Connectivity` |
| Models / Foreign Keys | `4_Models`, `6_Foreign_Key_Model` |
| React components/hooks/forms | `4_COMPONENT`–`13_FORM` |
