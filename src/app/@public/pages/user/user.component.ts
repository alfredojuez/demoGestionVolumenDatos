import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserinfoService } from '../../services/userinfo.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  constructor(private userService: UserinfoService,
    private router: Router) { }

  ngOnInit(): void {
  }

  cerrarSesion()
  {
    this.userService.cerrarSesion();
    this.router.navigate(['/home']);
  }

}
