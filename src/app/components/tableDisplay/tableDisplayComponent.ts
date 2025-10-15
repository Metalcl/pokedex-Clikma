import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { PaginatorState } from 'primeng/paginator';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { CardModule } from 'primeng/card';

import { PokemonDetailService } from '../../services/Pokmemon-detail.service';
import { SortDirection, SorterComponent } from '../../components/sorter/sorterComponent';
import { SearcherComponent } from '../../components/searcher/searcherComponent';

@Component({
  selector: 'app-table-display',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TitleCasePipe,
    SearcherComponent,
    SorterComponent,
    DialogModule,
    AvatarModule,
    CardModule
  ],
  styles: [`
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr:nth-child(even) {
        background-color: #202020;
        background-color: #44444;
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
        background-color: transparent !important;
    }
  `],
  templateUrl: './tableDisplayComponent.html',
})

export class TableDisplayComponent {
  @Input() pokemonList$!: Observable<any>;
  @Input() currentSortDirection: SortDirection = 'default';
  @Input() totalRecords: number = 0;

  @Input() first: number = 0;
  @Input() rows: number = 10;

  @Input() isSearching: boolean = false;
  @Input() errorMessage: string = '';

  visible: boolean = false;
  selectedPokemon: any = null;
  fullPokemonDetails: any = null;

  @Output() viewDetails = new EventEmitter<any>();
  @Output() search = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<SortDirection>();
  @Output() pageChange = new EventEmitter<PaginatorState>();

  constructor(private detailService: PokemonDetailService) { }

  hideDialog(): void {
    this.visible = false;
    this.selectedPokemon = null;
  }

  onViewDetails(pokemon: any): void {
    this.selectedPokemon = pokemon;
    this.fullPokemonDetails = null;
    this.visible = true;

    const identifier = pokemon.name;

    this.detailService.getPokemonDetails(identifier).subscribe({
      next: (details) => {
        if (details) {
          this.fullPokemonDetails = details;
          const { height, id, name, sprites, stats, types } = details;

          const dataToLog = {
            height,
            id,
            name,
            sprites,
            stats,
            types
          };

          console.log(dataToLog);

        } else {
          console.error('No se pudo cargar la data completa del Pokémon.');
          this.fullPokemonDetails = 'error';
        }
      },
      error: (err) => {
        console.error('Error al cargar detalles:', err);
        this.fullPokemonDetails = 'error';
      }
    });

  }

  onSearch(searchTerm: string): void {
    this.search.emit(searchTerm);
  }

  onSortChange(direction: SortDirection): void {
    this.sortChange.emit(direction);
  }

  onPageChange(event: PaginatorState) {
    this.pageChange.emit(event);
  }

  getPokemonId(url: string): string {
    if (!url) return '#?';
    const segments = url.split('/').filter(segment => segment);
    return segments.pop() || '#?';
  }
}
