import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';

interface PokemonListResponse {
  results: { name: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class PokemonDetailService {
  private apiUrl = 'https://pokeapi.co/api/v2/pokemon';

  private allPokemonNames$: Observable<string[]>;

  constructor(private http: HttpClient) {
    const limit = 1025;

    this.allPokemonNames$ = this.http.get<PokemonListResponse>(`${this.apiUrl}?limit=${limit}`).pipe(
      map(response => response.results.map(p => p.name)),
      shareReplay(1)
    );
  }


  searchPokemonNames(query: string): Observable<string[]> {
    if (!query) {
        return new Observable(observer => {
            observer.next([]);
            observer.complete();
        });
    }

    return this.allPokemonNames$.pipe(
      map(names =>
        names.filter(name => name.toLowerCase().startsWith(query.toLowerCase()))
      )
    );
  }
}
