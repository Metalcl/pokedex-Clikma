import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PokemonDetailService {
  private baseUrl = 'https://pokeapi.co/api/v2/pokemon';

  constructor(private http: HttpClient) { }

  getPokemonDetails(identifier: string | number): Observable<any> {
    const url = `${this.baseUrl}/${identifier}`;

    return this.http.get<any>(url).pipe(
      catchError(error => {
        console.error(`Error al obtener detalles para ${identifier}:`, error);
        return of(null);
      })
    );
  }
}
