import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserinfoService {
  logged = true;
  admin = false;

  constructor() {}

  isLogged() {
    return this.logged;
  }

  isAdmin() {
    return this.admin;
  }

  tryLogin()
  {
    this.logged=true;
  }

  tryLoginAdmin()
  {
    this.logged=true;
    this.admin=true;
  }

  cerrarSesion()
  {
    this.logged=false;
    this.admin=false;  
  }
}
