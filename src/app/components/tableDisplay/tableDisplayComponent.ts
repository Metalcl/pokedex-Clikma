import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Observable, catchError, map, of, startWith, tap } from 'rxjs';
import { PaginatorState } from 'primeng/paginator';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';

import { PokemonDetailService } from '../../services/Pokmemon-detail.service';
import { SortDirection, SorterComponent } from '../../components/sorter/sorterComponent';
import { SearcherComponent } from '../../components/searcher/searcherComponent';
import { TooltipModule } from 'primeng/tooltip';

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
    CardModule,
    TooltipModule,
    CarouselModule,
  ],
  styleUrls: ['./tableDisplayComponent.css'],
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
  fullPokemonDetails$!: Observable<any | 'error'>;

  @Output() viewDetails = new EventEmitter<any>();
  @Output() search = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<SortDirection>();
  @Output() pageChange = new EventEmitter<PaginatorState>();

  pokemonSprites: string[] = [];
  responsiveOptions: any[] = [
    { breakpoint: '1400px', numVisible: 1, numScroll: 1 },
    { breakpoint: '767px', numVisible: 1, numScroll: 1 },
    { breakpoint: '575px', numVisible: 1, numScroll: 1 },
  ];

  constructor(
    private detailService: PokemonDetailService,
    private cdr: ChangeDetectorRef
  ) { }

  private extractSprites(sprites: any): string[] {
    if (!sprites) return [];
    const orderedKeys = [
      'front_default',
      'back_default',
      'front_shiny',
      'back_shiny',
    ];

    const urls: string[] = [];
    for (const key of orderedKeys) {
      if (sprites[key] && typeof sprites[key] === 'string') {
        urls.push(sprites[key]);
      }
    }

    return urls;
  }

  hideDialog(): void {
    this.visible = false;
    this.selectedPokemon = null;
  }

  onViewDetails(pokemon: any): void {
    this.selectedPokemon = pokemon;
    this.visible = true;
    const identifier = pokemon.name;
    this.fullPokemonDetails$ = this.detailService.getPokemonDetails(identifier).pipe(
      tap(details => {
        if (details) {

          this.pokemonSprites = this.extractSprites(details.sprites);

          console.log({
            height: details.height,
            id: details.id,
            name: details.name,
            sprites: details.sprites,
            types: details.types,
            pokemonSprites: this.pokemonSprites
          });
        } else {
          console.error('No se pudo cargar la data completa del Pokémon.');
          this.pokemonSprites = [];
        }
      }),
      catchError(err => {
        console.error('Error al cargar detalles:', err);
        this.pokemonSprites = [];
        return of('error');
      })
    );
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
