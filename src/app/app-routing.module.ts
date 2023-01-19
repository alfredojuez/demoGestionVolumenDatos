import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  // Parte publica
  {
    path: 'home',
    loadChildren: () =>
      import('./@public/pages/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'home/:search',
    loadChildren: () =>
      import('./@public/pages/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'contact',
    loadChildren: () =>
      import('./@public/pages/contact/contact.module').then(
        (m) => m.ContactModule
      ),
  },
  {
    path: 'about',
    loadChildren: () =>
      import('./@public/pages/about/about.module').then((m) => m.AboutModule),
  },


  
  {
    path: 'public',
    loadChildren: () =>
      import('./@public/pages/public.module').then((m) => m.PublicModule),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./@admin/pages/admin.module').then((m) => m.AdminModule),
  },


  {
    path: 'not-found',
    loadChildren: () =>
      import('./@public/pages/not-found/not-found.module').then(
        (m) => m.NotFoundModule
      ),
  },


  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'not-found',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
