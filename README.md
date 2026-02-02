# UPSC.AI Frontend Setup Guide

This guide is for setting up the Frontend of the UPSC.AI application on a new machine.
The project is built with **React**, **Vite**, and **TailwindCSS**.

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js) or **yarn**

## 1. Clone the Repository

Clone the specific frontend repository or the monorepo and navigate to the `frontend` folder.

```bash
git clone <repository-url>
cd frontend
```

## 2. Install Dependencies

Install the required node modules:

```bash
npm install
# or
yarn install
```

## 3. Environment Configuration

Create a `.env` file in the root of the `frontend` directory.
You can copy the example below.

**`.env`**:
```env
# Connection to the Backend API (Default: Localhost)
VITE_API_BASE=http://localhost:3000

# Supabase Configuration (Ask Backend Team for these keys if not provided)
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

> **Note**: The frontend relies on the Backend for Authentication and Data. Ensure you have the `VITE_API_BASE` set to where the backend is running (locally or a staging URL).

## 4. Running the Development Server

Start the local development server:

```bash
npm run dev
# or
yarn dev
```

The application will typically be available at:
`http://localhost:5173`

## 5. Building for Production

To create a production-ready build:

```bash
npm run build
```

The output will be in the `dist` folder, which can be deployed to Vercel, Netlify, or AWS.

## Project Structure

- **`src/pages`**: Main application pages (Auth, Home, Library, etc.)
- **`src/components`**: Reusable UI components.
- **`src/lib`**: Utilities and API clients (`api.js`, `supabase.js`).
- **`src/contexts`**: Global state (AuthContext).

## Troubleshooting

- **CORS Errors**: Ensure the Backend allows requests from `http://localhost:5173`.
- **Auth Errors**: If login fails, check if the Backend Server is running and correctly configured with Google Credentials.
- **Missing Styles**: Ensure Tailwind is generating styles (check `tailwind.config.js` content matches your file structure).
