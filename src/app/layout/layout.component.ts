import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../core/services/theme.service';
import { AuthService } from '../core/services/auth.service';
import { ROLES } from '../core/models/usuario.model';
import { PermisosService } from '../shared/services/permisos.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  disponible: boolean;
}

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {

  sidenavAbierto = true;
  isAdmin = false;
  username: string | null = null;

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', disponible: true },
    { label: 'Reservaciones', icon: 'calendar_month', route: '/reservas', disponible: true },
    { label: 'Habitaciones', icon: 'bed', route: '/habitaciones', disponible: true },
    { label: 'Huéspedes', icon: 'people', route: '/huespedes', disponible: true },
    { label: 'Usuarios', icon: 'manage_accounts', route: '/usuarios', disponible: true },
    { label: 'Reportes', icon: 'assessment', route: '/reportes', disponible: true }
  ];

  constructor(
    public themeService: ThemeService,
    private authService: AuthService,
    public permisos: PermisosService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.username = this.authService.getUsername();
  }

  toggleSidenav(): void {
    this.sidenavAbierto = !this.sidenavAbierto;
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}