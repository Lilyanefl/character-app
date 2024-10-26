import { Component, OnInit } from '@angular/core';
import { CharacterService } from '../../services/characters.service';
import { AuthsrvService } from '../../auth/authsrv.service';
import { FavoritesService } from '../../services/favorites.service';
import { iCharacter } from '../../interfaces/i-character';
import { Subscription } from 'rxjs/internal/Subscription';
import { Observable } from 'rxjs';
import { iFav } from '../../interfaces/i-fav';

@Component({
  selector: 'app-characters',
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.scss',
})
export class CharactersComponent implements OnInit {
  characters: iCharacter[] = [];
  id!: number;
  private userSubscription: Subscription = new Subscription();
  favorites$: Observable<iFav[]> | undefined;

  constructor(
    private CharacterSvc: CharacterService,
    private FavSvc: FavoritesService,
    private authSvc: AuthsrvService
  ) {}

  ngOnInit(): void {
    this.authSvc.user$.subscribe((user) => {
      if (user) {
        this.id = user.id;
        this.FavSvc.loadUserFavorites(this.id);
      }
    });

    this.CharacterSvc.getAllCharacters().subscribe((char) => {
      this.characters = char;
      console.log(this.characters);
    });

    this.favorites$ = this.FavSvc.favs$;
  }

  addToFavorites(char: iCharacter): void {
    if (this.id) {
      this.FavSvc.addOrRemoveFavorite(char, this.id);
    } else {
      console.error("L'ID utente non è disponibile.");
    }
  }

  isFavorite(char: iCharacter): boolean {
    return this.FavSvc.getFavorites().some(
      (fav) => fav.characterId === char.id && fav.userId === this.id
    );
  }
}
