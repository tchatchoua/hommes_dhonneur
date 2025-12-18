import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/pages/login/login.page').then(m => m.LoginPage)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/pages/register/register.page').then(m => m.RegisterPage)
      }
    ]
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard.page').then(m => m.DashboardPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/pages/profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: 'contributions',
        loadComponent: () => import('./features/contributions/pages/contributions/contributions.page').then(m => m.ContributionsPage)
      },
      {
        path: 'debts',
        loadComponent: () => import('./features/debts/pages/debts/debts.page').then(m => m.DebtsPage)
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          {
            path: 'users',
            loadComponent: () => import('./features/admin/pages/users/users.page').then(m => m.AdminUsersPage)
          },
          {
            path: 'users/:id',
            loadComponent: () => import('./features/admin/pages/user-detail/user-detail.page').then(m => m.AdminUserDetailPage)
          },
          {
            path: 'categories',
            loadComponent: () => import('./features/admin/pages/categories/categories.page').then(m => m.AdminCategoriesPage)
          },
          {
            path: 'invitations',
            loadComponent: () => import('./features/admin/pages/invitations/invitations.page').then(m => m.AdminInvitationsPage)
          },
          {
            path: 'notifications',
            loadComponent: () => import('./features/admin/pages/notifications/notifications.page').then(m => m.AdminNotificationsPage)
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
