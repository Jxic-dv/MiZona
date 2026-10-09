import { Routes } from '@angular/router';
import { autenticado } from './guards/auth.guard';
import { administrador } from './guards/admin.guard';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/avisos/avisos').then((m) => m.AvisosPage),
    title: 'MiZona · Avisos de tu comunidad',
  },
  {
    path: 'avisos/:id',
    loadComponent: () => import('./pages/detalle/detalle').then((m) => m.DetallePage),
    title: 'Detalle del aviso · MiZona',
  },
  {
    path: 'suscribirme',
    loadComponent: () => import('./pages/suscripcion/suscripcion').then((m) => m.SuscripcionPage),
    title: 'Recibir avisos · MiZona',
  },
  {
    path: 'acceso',
    loadComponent: () => import('./pages/acceso/acceso').then((m) => m.AccesoPage),
    title: 'Acceso municipal · MiZona',
  },
  {
    path: 'panel',
    canActivate: [autenticado],
    canActivateChild: [autenticado],
    loadComponent: () => import('./pages/panel/panel').then((m) => m.PanelPage),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'avisos' },
      {
        path: 'resumen',
        canActivate: [administrador],
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.DashboardPage),
        title: 'Resumen · MiZona',
      },
      {
        path: 'avisos',
        loadComponent: () =>
          import('./pages/gestion-avisos/gestion-avisos').then((m) => m.GestionAvisosPage),
        title: 'Gestión de avisos · MiZona',
      },
      {
        path: 'avisos/nuevo',
        loadComponent: () => import('./pages/editor/editor').then((m) => m.EditorPage),
        title: 'Nuevo aviso · MiZona',
      },
      {
        path: 'avisos/:id/editar',
        loadComponent: () => import('./pages/editor/editor').then((m) => m.EditorPage),
        title: 'Editar aviso · MiZona',
      },
      {
        path: 'zonas',
        canActivate: [administrador],
        data: { tipo: 'zonas' },
        loadComponent: () => import('./pages/catalogos/catalogos').then((m) => m.CatalogosPage),
        title: 'Zonas · MiZona',
      },
      {
        path: 'categorias',
        canActivate: [administrador],
        data: { tipo: 'categorias' },
        loadComponent: () => import('./pages/catalogos/catalogos').then((m) => m.CatalogosPage),
        title: 'Categorías · MiZona',
      },
      {
        path: 'usuarios',
        canActivate: [administrador],
        loadComponent: () => import('./pages/usuarios/usuarios').then((m) => m.UsuariosPage),
        title: 'Usuarios · MiZona',
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/perfil/perfil').then((m) => m.PerfilPage),
        title: 'Mi perfil · MiZona',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
