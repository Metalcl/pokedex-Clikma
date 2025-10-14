// pokedexPage.ts

import { PokemonService } from './../services/Pokemons.services';
import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { tap } from 'rxjs/operators';
import { CardModule } from 'primeng/card'
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-pokedex-page',
  standalone: true,
  imports: [CommonModule, PaginatorModule, TitleCasePipe, CardModule, SkeletonModule],
  templateUrl: './pokedexPage.html',
})
export class PokedexPage implements OnInit {

  pokemonList$!: Observable<any>;

  totalRecords: number = 0;
  limit: number = 10;
  offset: number = 0;

  errorMessage: string = '';

  constructor(private pokemonService: PokemonService) { }

  ngOnInit(): void {
    this.loadPokemonList();
  }

  loadPokemonList(): void {
    this.pokemonList$ = this.pokemonService.getPokemonList(this.limit, this.offset)
      .pipe(
        tap(data => {
          this.totalRecords = data.count;
        })
      );
  }

  onPageChange(event: PaginatorState) {
    this.offset = event.first ?? 0;
    this.limit = event.rows ?? 10;

    this.loadPokemonList();
  }

  getPokemonId(index: number): number {
    return this.offset + index + 1;
  }
}
