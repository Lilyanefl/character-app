import { Component, OnInit } from '@angular/core';
import { AuthsrvService } from '../../auth/authsrv.service';
import { Router } from '@angular/router';
import { iUser } from '../../interfaces/i-user';
import { FavoritesService } from '../../services/favorites.service';
import { Observable } from 'rxjs';
import { iCharacter } from '../../interfaces/i-character';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  user!: iUser;
  favoriteCharacters$: Observable<iCharacter[]> | undefined;

  constructor(
    private authSrv: AuthsrvService,
    private router: Router,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    this.authSrv.user$.subscribe((user) => {
      if (user) {
        this.user = user;
        this.favoriteCharacters$ =
          this.favoritesService.loadUserFavoritesWithCharacters(user.id);
      }
    });
  }

  logout() {
    this.authSrv.logout();
    this.router.navigate(['auth']);
  }
}
