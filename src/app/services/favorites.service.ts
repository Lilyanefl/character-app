import { Injectable } from '@angular/core';
import { iFav } from '../interfaces/i-fav';
import { iCharacter } from '../interfaces/i-character';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  BehaviorSubject,
  filter,
  tap,
  switchMap,
  forkJoin,
} from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private favs: iFav[] = [];
  private favSubject = new BehaviorSubject<iFav[]>(this.favs);
  favs$ = this.favSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadUserFavorites(userId: number): void {
    if (userId < 0) {
      console.error('Invalid user ID:', userId);
      return;
    }

    this.getFavsByUserId(userId)
      .pipe(
        filter(Boolean),
        tap((favs) => {
          this.favs = favs;
          this.favSubject.next(this.favs);
        })
      )
      .subscribe({
        next: (favs) => console.log('Favorites loaded:', favs),
        error: (err) => {
          if (err.status === 404) {
            this.favs = [];
            this.favSubject.next(this.favs);
          } else {
            console.error('Error loading favorites:', err);
          }
        },
      });
  }
  removeFavorite(favorite: iFav): void {
    const favoriteIndex = this.favs.findIndex(
      (fav) =>
        fav.characterId === favorite.characterId &&
        fav.userId === favorite.userId
    );

    if (favoriteIndex > -1) {
      const favoriteToRemove = this.favs[favoriteIndex];
      this.favs.splice(favoriteIndex, 1);
      this.removeFavoriteFromDb(favoriteToRemove);
      this.favSubject.next(this.favs);
    } else {
      console.log('Nessun preferito trovato per la rimozione:', favorite);
    }
  }

  addOrRemoveFavorite(Character: iCharacter, userId: number): void {
    const favoriteIndex = this.favs.findIndex(
      (fav) => fav.characterId === Character.id && fav.userId === userId
    );

    if (favoriteIndex > -1) {
      const favoriteToRemove = this.favs[favoriteIndex];
      this.favs.splice(favoriteIndex, 1);
      this.removeFavoriteFromDb(favoriteToRemove);
    } else {
      const newFav: iFav = { userId, characterId: Character.id };
      this.favs.push(newFav);
      this.addFavoriteToDb(newFav);
    }

    this.favSubject.next(this.favs);
  }

  private addFavoriteToDb(favorite: iFav): void {
    this.http.post<iFav>(environment.characterFavUrl, favorite).subscribe({
      next: (response) => {
        this.favs[this.favs.length - 1].id = response.id;
      },
      error: (err) =>
        console.error('Errore durante il salvataggio del preferito:', err),
    });
  }

  private removeFavoriteFromDb(favorite: iFav): void {
    this.http
      .get<iFav[]>(
        `${environment.characterFavUrl}?userId=${favorite.userId}&characterId=${favorite.characterId}`
      )
      .subscribe({
        next: (favs) => {
          if (favs.length > 0) {
            const favId = favs[0].id;
            this.http
              .delete(`${environment.characterFavUrl}/${favId}`)
              .subscribe({
                next: () =>
                  console.log('Character rimosso dal database:', favorite),
                error: (err) =>
                  console.error(
                    'Errore durante la rimozione del Character dal database:',
                    err
                  ),
              });
          } else {
            console.log('Nessun preferito trovato per rimozione:', favorite);
          }
        },
        error: (err) =>
          console.error('Errore durante la ricerca del preferito:', err),
      });
  }
  getFavsByUserId(userId: number): Observable<iFav[]> {
    return this.http.get<iFav[]>(
      `${environment.characterFavUrl}?userId=${userId}`
    );
  }
  public getFavorites(): iFav[] {
    return this.favs;
  }
  loadUserFavoritesWithCharacters(userId: number): Observable<iCharacter[]> {
    return this.getFavsByUserId(userId).pipe(
      switchMap((favorites) => {
        const characterIds = favorites.map((fav) => fav.characterId);
        return this.getCharactersByIds(characterIds);
      })
    );
  }
  private getCharactersByIds(characterIds: number[]): Observable<iCharacter[]> {
    const requests = characterIds.map((id) =>
      this.http.get<iCharacter>(`${environment.characterURL}/${id}`)
    );
    return forkJoin(requests);
  }
}
