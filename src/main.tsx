import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter, createRoute } from '@tanstack/react-router'
import './index.css'
import { Route as rootRoute } from './routes/__root'

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: React.lazy(() => import('./routes/index.lazy').then(m => ({ default: m.Index })))
})

const gameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/game',
  component: React.lazy(() => import('./routes/game.lazy').then(m => ({ default: m.Game })))
})

const routeTree = rootRoute.addChildren([indexRoute, gameRoute])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
