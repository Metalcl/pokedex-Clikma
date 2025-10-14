import { PokemonService } from './../services/Pokemons.services';
import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { SearcherComponent } from '../components/searcher/searcherComponent';

import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { CardModule } from 'primeng/card'
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-pokedex-page',
  standalone: true,
  imports: [CommonModule, SearcherComponent, PaginatorModule, TitleCasePipe, CardModule, SkeletonModule],
  templateUrl: './pokedexPage.html',
})
export class PokedexPage implements OnInit {

  pokemonList$!: Observable<any>;
  searchTerm: string = '';
  isSearching: boolean = false;

  totalRecords: number = 0;
  limit: number = 10;
  offset: number = 0;

  errorMessage: string = '';

  constructor(private pokemonService: PokemonService) { }

  ngOnInit(): void {
    this.loadPokemonList();
  }

  // --- Lógica de Carga de Lista y Búsqueda ---

  loadPokemonList(): void {
    if (this.searchTerm.trim()) {
      this.isSearching = true;
      this.errorMessage = '';

      this.pokemonList$ = this.pokemonService.searchPokemon(this.searchTerm)
        .pipe(
          tap(data => {
            this.errorMessage = data.count > 0 ? '' : 'Ningún pokemón coincide con los carácteres de tu busqueda.';
          }),
          catchError((error) => {
            console.error('Error en la búsqueda:', error);
            this.errorMessage = 'Hubo un error inesperado durante la búsqueda.';
            return of({ results: [], count: 0 });
          })
        );

    }
    // Paginación
    else {
      this.isSearching = false;
      this.errorMessage = '';

      if (this.offset >= 1025) {
        this.pokemonList$ = of({ results: [], count: 1025 });
        this.totalRecords = 1025;
        return;
      }

      this.pokemonList$ = this.pokemonService.getPokemonList(this.limit, this.offset)
        .pipe(
          tap(data => {
            this.totalRecords = 1025;
          }),
          catchError((error) => {
            console.error('Error cargando lista paginada:', error);
            this.errorMessage = 'Hubo un error al cargar la lista de Pokémon.';
            return of({ results: [], count: 1025 });
          })
        );
    }
  }

  onSearch(searchTerm: string): void {
    const newSearchTerm = searchTerm.toLowerCase().trim();

    if (this.searchTerm !== newSearchTerm) {
      this.searchTerm = newSearchTerm;
      this.offset = 0;
      this.loadPokemonList();
    }
  }

  onPageChange(event: PaginatorState) {
    if (!this.isSearching) {
      this.offset = event.first ?? 0;
      this.limit = event.rows ?? 10;

      this.loadPokemonList();
    }
  }

  getPokemonId(index: number, pokemonUrl?: string): number {
    let id: number;

    if (pokemonUrl) {
      const parts = pokemonUrl.split('/');
      id = Number(parts[parts.length - 2]);
    } else {
      id = this.offset + index + 1;
    }

    if (id > 1025) {
      return 0;
    }

    return id;
  }
}
