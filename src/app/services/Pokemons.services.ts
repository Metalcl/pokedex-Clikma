import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap, map, catchError, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private baseUrl = 'https://pokeapi.co/api/v2/pokemon';
  private allPokemonList$: Observable<any> | undefined;

  constructor(private http: HttpClient) { }

  getPokemonList(limit: number, offset: number): Observable<any> {
    return this.http.get(`${this.baseUrl}?limit=${limit}&offset=${offset}`);
  }

  private getAllPokemonList(): Observable<any> {
    if (!this.allPokemonList$) {
      this.allPokemonList$ = this.http.get(`${this.baseUrl}?limit=1025&offset=0`).pipe(
        shareReplay(1),
        catchError(error => {
          console.error('Error al cargar la lista completa de Pokémon:', error);
          return of({ results: [], count: 0 });
        })
      );
    }
    return this.allPokemonList$;
  }
  searchPokemon(term: string): Observable<any> {
    if (!term) {
      return of({ results: [], count: 0 });
    }
    const id = Number(term);
    if (!isNaN(id) && id > 0 && id <= 1025) {
      return this.http.get(`${this.baseUrl}/${id}`).pipe(
        map(data => ({
          results: [{ name: (data as any).name, url: `${this.baseUrl}/${id}/` }],
          count: 1
        })),
        catchError(() => of({ results: [], count: 0 }))
      );
    }

    return this.getAllPokemonList().pipe(
      map(data => {
        const filteredResults = data.results.filter((pokemon: any) =>
          pokemon.name.includes(term)
        );

        return {
          results: filteredResults,
          count: filteredResults.length,
        };
      })
    );
  }
}
