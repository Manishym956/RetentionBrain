# RetentionBrain Project Setup

Welcome to the RetentionBrain repository. This project contains a modern Next.js frontend (App Router) and a Django REST Framework backend designed for a clean, modular architecture ready for ML integration.

## Project Structure

```
RetentionBrain/
├── frontend/             # Next.js 14 (App Router, TailwindCSS, TypeScript)
├── backend/              # Django REST Framework
└── README.md             # This file
```

## Prerequisites

- Node.js (v18+)
- Python (3.10+)

---

## 🏗️ Backend Setup (Django)

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment (Windows):
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
   *(On macOS/Linux: `source venv/bin/activate`)*

3. Install the required dependencies:
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers psycopg2-binary python-dotenv
   ```
   *(Note: The current configuration uses SQLite for rapid development. PostgreSQL and psycopg2 are ready when you decide to switch databases in `settings.py`)*

4. Run the initial database migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. (Optional) Create a superuser to access the Django admin panel (`http://localhost:8000/admin/`):
   ```bash
   python manage.py createsuperuser
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```
   The backend API will run on **http://localhost:8000**

### Available Endpoints:
- `POST /api/register/` - Register a new user
- `POST /api/login/` - JWT Login (returns `access` and `refresh` tokens)
- `POST /api/login/refresh/` - Refresh JWT token
- `GET /api/health/` - Check if API is running
- `POST /api/upload/` - Upload a CSV file (Requires JWT auth header)

---

## 🎨 Frontend Setup (Next.js)

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install the necessary NPM dependencies:
   ```bash
   npm install
   ```
   *(Axios and Lucide React icons are already configured)*

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend will run on **http://localhost:3000**

### Frontend Features:
- **Axios Configuration**: Pre-configured at `frontend/lib/axios.ts` to automatically attach JWT tokens from local storage.
- **Routing**: Setup via Next App Router.
   - `/` - Landing Page
   - `/login` - Auth Page (Login/Registration Forms)
   - `/dashboard` - Protected dashboard shell displaying metrics
   - `/upload` - Protected CSV Upload page
- **UI Components**: Check `frontend/components/ui/` for custom built components like `Button`, `Card`, and `Table`.

## 🚀 What's Next?
Currently, the upload API performs a mockup successful intake of CSV files while adhering to the initial project phase constraints. In Phase 2, the ML and SHAP integrations will be connected natively through the Django endpoints.
