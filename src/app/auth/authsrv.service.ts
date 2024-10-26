import { Injectable } from '@angular/core';
import { iUser } from '../interfaces/i-user';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment.development';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { iLoginRequest } from '../interfaces/i-login-request';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { iAccessData } from '../interfaces/i-access-data';

@Injectable({
  providedIn: 'root',
})
export class AuthsrvService {
  jwtHelper: JwtHelperService = new JwtHelperService();

  registerUrl: string = environment.registerUrl;
  loginUrl: string = environment.loginUrl;
  autoLogoutTimer: any;

  authSubject$ = new BehaviorSubject<iAccessData | null>(null);

  user$ = this.authSubject$.asObservable().pipe(
    tap((accessData) => this.isLoggedIn == !!accessData),
    map((accessData) => accessData?.user)
  );

  isLoggedIn$ = this.authSubject$.pipe(map((accessData) => !!accessData));

  isLoggedIn: boolean = false;

  constructor(private http: HttpClient, private router: Router) {
    this.restoreUser();
  }

  register(newUser: Partial<iUser>) {
    return this.http.post<iAccessData>(this.registerUrl, newUser);
  }

  login(authData: iLoginRequest) {
    console.log(authData);
    return this.http.post<iAccessData>(this.loginUrl, authData).pipe(
      tap((data) => {
        this.authSubject$.next(data);
        sessionStorage.setItem('data', JSON.stringify(data));
        const expDate = this.jwtHelper.getTokenExpirationDate(data.accessToken);
        if (!expDate) return;
        this.autoLogout(expDate);
      })
    );
  }

  logout() {
    this.authSubject$.next(null);
    sessionStorage.removeItem('data');
    this.router.navigate(['/auth/login']);
  }

  autoLogout(expDate: Date) {
    const expMs = expDate.getTime() - new Date().getTime();
    this.autoLogoutTimer = setTimeout(() => {
      this.logout();
    }, expMs);
  }

  restoreUser() {
    const user: string | null = sessionStorage.getItem('data');
    if (!user) return;

    const data: iAccessData = JSON.parse(user);

    if (this.jwtHelper.isTokenExpired(data.accessToken)) {
      sessionStorage.removeItem('data');
      return;
    }

    this.authSubject$.next(data);
  }
}
