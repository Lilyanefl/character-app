import { Component, OnInit } from '@angular/core';
import { AuthsrvService } from '../auth/authsrv.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  logged = false;

  constructor(private authSrv: AuthsrvService) {}

  ngOnInit(): void {
    this.authSrv.isLoggedIn$.subscribe((isLoggedIn) => {
      this.logged = isLoggedIn;
    });
  }
}
