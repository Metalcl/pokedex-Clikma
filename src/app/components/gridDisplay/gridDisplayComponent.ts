import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Observable } from 'rxjs';

import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { SearcherComponent } from '../../components/searcher/searcherComponent';
import { SorterComponent, SortDirection } from '../../components/sorter/sorterComponent';

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

@Component({
  selector: 'app-grid-display',
  standalone: true,
  imports: [
    CommonModule, TitleCasePipe, PaginatorModule, CardModule, SkeletonModule,
    SearcherComponent, SorterComponent,
  ],
  templateUrl: './gridDisplayComponent.html',
  styles: [`
    .pokedex-grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1rem;
        padding: 1rem;
    }
  `]
})
export class GridDisplayComponent {

  @Input() pokemonList$!: Observable<PokemonListResponse | null>;
  @Input() currentSortDirection: SortDirection = 'default';
  @Input() totalRecords: number = 0;
  @Input() limit: number = 10;
  @Input() offset: number = 0;
  @Input() isSearching: boolean = false;
  @Input() errorMessage: string = '';

  @Output() search = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<SortDirection>();
  @Output() pageChange = new EventEmitter<PaginatorState>();

  onSearch(searchTerm: string): void {
    this.search.emit(searchTerm);
  }

  onSortChange(direction: SortDirection): void {
    this.sortChange.emit(direction);
  }

  onPageChange(event: PaginatorState): void {
    if (!this.isSearching) {
      this.pageChange.emit(event);
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
