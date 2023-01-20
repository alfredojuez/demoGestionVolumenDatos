import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserinfoService } from './@public/services/userinfo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'bomberos-front';
  logged = false;
  admin = false;

  constructor(
    private servicioLogin: UserinfoService,
    private router: Router
  ) {}

  ngOnInit() {

    let urlTree = this.router.parseUrl(this.router.url);
    let busqueda = urlTree.queryParams['search'];
  }

  estoyLogado() {
    return this.servicioLogin.isLogged();
  }
  soyAdmin() {
    return this.servicioLogin.isAdmin();
  }

  @Input() filtro: string;

  filtraDatos() {
    console.log('Busqueda del texto');
    console.log(this.filtro);
    //this.route.navigate(['/home', this.filtro]);
  }
}
