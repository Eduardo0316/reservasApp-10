import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/rol.guard';
import { ROLES } from './core/models/usuario.model';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { roles: [ROLES[0]]},
        loadChildren: () => import('./usuarios/usuarios.module').then(m => m.UsuariosModule)
      },
      { path: 'huespedes',    loadChildren: () => import('./huespedes/huespedes.module').then(m => m.HuespedesModule) },
      { path: 'habitaciones', loadChildren: () => import('./habitaciones/habitaciones.module').then(m => m.HabitacionesModule) },
      { path: 'reservas',     loadChildren: () => import('./reservas/reservas.module').then(m => m.ReservasModule) },
      {
        path: 'reportes',
        canActivate: [roleGuard],
        data: { roles: [ROLES[0]] },          // solo ADMIN, igual que 'usuarios'
        loadChildren: () => import('./reportes/reportes.module').then(m => m.ReportesModule)
      }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }