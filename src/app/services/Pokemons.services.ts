import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap, map, catchError, shareReplay } from 'rxjs/operators';

interface PokemonResult {
  name: string;
  url: string;
  imageUrlDreamWorld: string | null;
  imageUrlDefault: string;
}

interface PokemonListResponse {
  count: number;
  results: PokemonResult[];
}

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private baseUrl = 'https://pokeapi.co/api/v2/pokemon';
  private allPokemonList$: Observable<any> | undefined;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista paginada y luego los detalles de la imagen para cada Pokémon.
   */
  getPokemonList(limit: number, offset: number): Observable<PokemonListResponse> {
    return this.http.get<any>(`${this.baseUrl}?limit=${limit}&offset=${offset}`).pipe(
      switchMap(response =>
        this.getPokemonDetailsWithImages(response.results).pipe(
          map(resultsWithImages => ({
            count: response.count,
            results: resultsWithImages
          }))
        )
      )
    );
  }

  private getPokemonDetailsWithImages(results: { name: string, url: string }[]): Observable<PokemonResult[]> {
    if (results.length === 0) {
      return of([]);
    }

    const detailRequests = results.map(pokemon =>
      this.http.get<any>(pokemon.url).pipe(
        map(detail => ({
          name: pokemon.name,
          url: pokemon.url,
          imageUrlDreamWorld: detail.sprites.other?.dream_world?.front_default || null,
          imageUrlDefault: detail.sprites.front_default || ''
        })),
        catchError(error => {
          console.error(`Error al obtener detalles para ${pokemon.name}:`, error);
          return of({ name: pokemon.name, url: pokemon.url, imageUrlDreamWorld: null, imageUrlDefault: '' });
        })
      )
    );

    return forkJoin(detailRequests);
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

  searchPokemon(term: string): Observable<PokemonListResponse> {
    if (!term) {
      return of({ results: [], count: 0 });
    }

    const id = Number(term);
    if (!isNaN(id) && id > 0 && id <= 1025) {
      return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
        map(data => ({
          results: [{
            name: data.name,
            url: `${this.baseUrl}/${id}/`,
            imageUrlDreamWorld: data.sprites.other?.dream_world?.front_default || null,
            imageUrlDefault: data.sprites.front_default || ''
          }],
          count: 1
        })),
        catchError(() => of({ results: [], count: 0 }))
      );
    }

    return this.getAllPokemonList().pipe(
      map(data => {
        const filteredResults = data.results.filter((pokemon: any) =>
          pokemon.name.includes(term.toLowerCase())
        );

        return {
          results: filteredResults,
          count: filteredResults.length,
        };
      }),
      switchMap(filteredResponse => this.getPokemonDetailsWithImages(filteredResponse.results).pipe(
        map(resultsWithImages => ({
          count: filteredResponse.count,
          results: resultsWithImages
        }))
      ))
    );
  }
}
