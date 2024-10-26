import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { iCharacter } from '../interfaces/i-character';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  constructor(private http: HttpClient) {}

  getAllCharacters() {
    return this.http.get<iCharacter[]>(environment.characterURL);
  }
}
