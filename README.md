
  # Ecommerce UI for Keycap Shop

  This is a code bundle for Ecommerce UI for Keycap Shop. The original project is available at https://www.figma.com/design/KHkcpRJtGQawAVVzatymwz/Ecommerce-UI-for-Keycap-Shop.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  # keycap-shop-frontend

## Environment

Create `.env.local` for local development:

```text
VITE_API_URL=http://localhost:8080
```

Only public frontend configuration may use the `VITE_` prefix. Never put
database passwords, JWT secrets, or private API keys in frontend environment
variables.

## DigitalOcean App Platform

Deploy this project as a Static Site with:

```text
Build command: npm ci && npm run build
Output directory: dist
Environment variable: VITE_API_URL=https://<backend-domain>.ondigitalocean.app
```

This application uses `createBrowserRouter`. Configure the Static Site catch-all
or fallback rewrite to serve `/index.html` for frontend routes such as `/login`,
`/admin`, and `/staff`; otherwise refreshing a nested route returns HTTP 404.
