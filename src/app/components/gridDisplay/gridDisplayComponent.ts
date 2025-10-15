import { Component, EventEmitter, Input, Output, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Observable, of, catchError, tap } from 'rxjs';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';

import { DialogModule } from 'primeng/dialog';
import { CarouselModule } from 'primeng/carousel';
import { ChartModule } from 'primeng/chart';

import { SearcherComponent } from '../../components/searcher/searcherComponent';
import { SorterComponent, SortDirection } from '../../components/sorter/sorterComponent';

import { PokemonDetailService } from '../../services/Pokmemon-detail.service';


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

    DialogModule, CarouselModule, ChartModule
  ],
  styleUrls: ['../gridDisplay/gridDisplayComponent.css'],
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
export class GridDisplayComponent implements OnInit {

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

  visible: boolean = false;
  selectedPokemon: any = null;
  fullPokemonDetails$!: Observable<any | 'error'>;
  pokemonSprites: string[] = [];

  responsiveOptions: any[] = [
    { breakpoint: '1400px', numVisible: 1, numScroll: 1 },
    { breakpoint: '767px', numVisible: 1, numScroll: 1 },
    { breakpoint: '575px', numVisible: 1, numScroll: 1 },
  ];

  statsData: any;
  statsOptions: any;

  constructor(
    private detailService: PokemonDetailService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.statsOptions = this.initializeStatsOptions();
  }

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

  getPokemonId(url: string): string {
    if (!url) return '#?';
    const segments = url.split('/').filter(segment => segment);
    return segments.pop() || '#?';
  }

  private initializeStatsOptions(): any {
    const chartColor = '#7E57C2';
    const textColor = '#F0F0F0';
    const gridColor = '#444444';
    const maxStatValue = 255;
    return {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        r: {
          min: 0,
          max: maxStatValue,
          pointLabels: {
            color: textColor,
            font: {
              size: 14
            }
          },
          grid: {
            color: gridColor,
          },
          angleLines: {
            color: gridColor,
          },
          ticks: {
            display: false
          },
        },
      },
    };
  }

  private setupRadarChart(details: any) {
    if (!details || !details.stats) return;
    const statNameMap: { [key: string]: string } = {
      'hp': 'Vida', 'attack': 'Ataque', 'defense': 'Defensa',
      'special-attack': 'Atq. Especial', 'special-defense': 'Def. Especial',
      'speed': 'Velocidad',
    };
    const labels = details.stats.map((s: any) => {
      const name = s.stat.name.toLowerCase();
      return statNameMap[name] || name.toUpperCase();
    });

    const dataValues = details.stats.map((s: any) => s.base_stat);
    const chartColor = '#7E57C2';
    const textColor = '#F0F0F0';

    this.statsData = {
      labels: labels,
      datasets: [
        {
          label: 'Estadísticas Base',
          data: dataValues,
          borderColor: chartColor,
          backgroundColor: 'rgba(126, 87, 194, 0.2)',
          pointBackgroundColor: chartColor,
          pointBorderColor: textColor,
          pointHoverBackgroundColor: textColor,
          pointHoverBorderColor: chartColor,
        },
      ],
    };
  }

  private extractSprites(sprites: any): string[] {
    if (!sprites) return [];
    const orderedKeys = [
      'front_default', 'back_default', 'front_shiny', 'back_shiny',
    ];

    const urls: string[] = [];
    for (const key of orderedKeys) {
      if (sprites[key] && typeof sprites[key] === 'string') {
        urls.push(sprites[key]);
      }
    }
    return urls;
  }

  onViewDetails(pokemon: any): void {
    this.selectedPokemon = pokemon;
    this.visible = true;
    const identifier = pokemon.name;

    this.fullPokemonDetails$ = of(null);
    this.pokemonSprites = [];
    this.statsData = null;

    this.fullPokemonDetails$ = this.detailService.getPokemonDetails(identifier).pipe(
      tap(details => {
        if (details) {
          this.pokemonSprites = this.extractSprites(details.sprites);
          this.setupRadarChart(details);
        } else {
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

  getTypeNameInSpanish(typeName: string): string {
    const typeMap: { [key: string]: string } = {
      'normal': 'Normal', 'fire': 'Fuego', 'water': 'Agua',
      'grass': 'Planta', 'electric': 'Eléctrico', 'ice': 'Hielo',
      'fighting': 'Lucha', 'poison': 'Veneno', 'ground': 'Tierra',
      'flying': 'Volador', 'psychic': 'Psíquico', 'bug': 'Bicho',
      'rock': 'Roca', 'ghost': 'Fantasma', 'dragon': 'Dragón',
      'steel': 'Acero', 'fairy': 'Hada', 'dark': 'Siniestro',
    };
    const lowerCaseName = typeName.toLowerCase();
    return typeMap[lowerCaseName] || typeName;
  }
}
