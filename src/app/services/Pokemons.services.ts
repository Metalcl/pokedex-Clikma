import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class PokemonService {

  private apiUrl = 'https://pokeapi.co/api/v2';
  private readonly MAX_POKEMON_ID = 1025;
  private pokemonCache = new Map<string, any>();
  constructor(private http: HttpClient) { }

  getPokemonList(limit: number = 20, offset: number = 0): Observable<any> {

    let adjustedLimit = limit;
    if (offset + limit > this.MAX_POKEMON_ID) {
      adjustedLimit = this.MAX_POKEMON_ID - offset;
    }

    if (offset >= this.MAX_POKEMON_ID) {
      return of({ results: [], count: this.MAX_POKEMON_ID, next: null, previous: null });
    }

    const cacheKey = `${this.apiUrl}/pokemon?limit=${adjustedLimit}&offset=${offset}`;

    if (this.pokemonCache.has(cacheKey)) {
      const cachedData = this.pokemonCache.get(cacheKey);
      return of({ ...cachedData, count: this.MAX_POKEMON_ID });
    }

    return this.http.get<any>(cacheKey).pipe(
      tap(data => {
        this.pokemonCache.set(cacheKey, data);
      }),
      map(data => {
        const nextOffset = offset + adjustedLimit;

        const nextUrl = (nextOffset < this.MAX_POKEMON_ID)
          ? `${this.apiUrl}/pokemon?limit=${limit}&offset=${nextOffset}`
          : null;

        return {
          ...data,
          count: this.MAX_POKEMON_ID,
          next: nextUrl,
        };
      })
    );
  }

  getPokemonDetails(nameOrId: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/pokemon/${nameOrId}`);
  }
}
