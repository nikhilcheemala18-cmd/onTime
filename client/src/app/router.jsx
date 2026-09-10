import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './routeGuards.jsx'
import RootLayout from '../layouts/RootLayout.jsx'
import AppLayout from '../layouts/AppLayout.jsx'
import BoardPage from '../pages/BoardPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'
import WorkspacePage from '../pages/WorkspacePage.jsx'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'register',
            element: <RegisterPage />,
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/',
            element: <AppLayout />,
            children: [
              {
                index: true,
                element: <DashboardPage />,
              },
              {
                path: 'app',
                element: <DashboardPage />,
              },
              {
                path: 'workspaces/:workspaceId',
                element: <WorkspacePage />,
              },
              {
                path: 'workspaces/:workspaceId/boards/:boardId',
                element: <BoardPage />,
              },
            ],
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
