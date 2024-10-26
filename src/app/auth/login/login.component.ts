import { AuthsrvService } from './../authsrv.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { iLoginRequest } from '../../interfaces/i-login-request';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginFormData: iLoginRequest = {
    email: '',
    password: '',
  };

  errorMessage: string | null = null;

  constructor(private authSvc: AuthsrvService, private router: Router) {}

  ngOnInit(): void {}

  login() {
    this.authSvc.login(this.loginFormData).subscribe({
      next: () => {
        this.router.navigate(['characters']);
      },
      error: (err) => {
        console.error('Login failed', err);
        this.errorMessage = 'Login fallito. Verifica le tue credenziali.';
      },
    });
  }

  @ViewChild('loginForm') loginForm!: NgForm;

  submit(form: NgForm) {
    if (form.valid) {
      this.errorMessage = null;
      this.login();
    }
  }
}
