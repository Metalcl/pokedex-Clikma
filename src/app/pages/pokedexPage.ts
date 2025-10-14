import { PokemonService } from './../services/Pokemons.services';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';


import { GridDisplayComponent } from '../components/gridDisplay/gridDisplayComponent';
import { TableDisplayComponent } from '../components/tableDisplay/tableDisplayComponent';

import { SortDirection } from '../components/sorter/sorterComponent';
import { PaginatorState } from 'primeng/paginator';


@Component({
  selector: 'app-pokedex-page',
  standalone: true,
  imports: [CommonModule, GridDisplayComponent, TableDisplayComponent],
  templateUrl: '../pages/pokedexPage.html',
})
export class PokedexPage implements OnInit {

  pokemonList$!: Observable<any>;
  searchTerm: string = '';
  isSearching: boolean = false;

  currentSortDirection: SortDirection = 'default';
  currentView: 'table' | 'grid' = 'table';

  totalRecords: number = 0;
  limit: number = 10;
  offset: number = 0;

  errorMessage: string = '';

  constructor(private pokemonService: PokemonService) { }

  ngOnInit(): void {
    this.loadPokemonList();
  }

  onSortChange(direction: SortDirection): void {
    this.currentSortDirection = direction;
    this.loadPokemonList();
  }

  private applySort(data: any): any {
    if (!data?.results || this.currentSortDirection === 'default') {
      return data;
    }

    data.results.sort((a: any, b: any) => {
      const comparison = a.name.localeCompare(b.name);
      return this.currentSortDirection === 'asc' ? comparison : -comparison;
    });

    return data;
  }

  loadPokemonList(): void {
    if (this.searchTerm.trim()) {
      this.isSearching = true;
      this.errorMessage = '';

      this.pokemonList$ = this.pokemonService.searchPokemon(this.searchTerm)
        .pipe(
          map(data => this.applySort(data)),
          tap(data => {
            this.errorMessage = data.results && data.results.length > 0 ? '' : 'No se encontraron Pokémon que coincidan con la búsqueda.';
            this.totalRecords = data.results?.length ?? 0;
          }),
          catchError((error) => {
            console.error('Error en la búsqueda:', error);
            this.errorMessage = 'Hubo un error inesperado durante la búsqueda.';
            return of({ results: [], count: 0 });
          })
        );
    }
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
          map(data => this.applySort(data)),
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

  setView(view: 'grid' | 'table'): void {
    this.currentView = view;
  }
}
