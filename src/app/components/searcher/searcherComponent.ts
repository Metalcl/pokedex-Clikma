import {
  Component, EventEmitter, Output, forwardRef, NgZone, OnInit, OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { BehaviorSubject, Subscription, EMPTY } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { PokemonDetailService } from '../../services/pokemon-detail.service';

const CUSTOM_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SearcherComponent),
  multi: true
};


@Component({
  selector: 'app-searcher',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AutoCompleteModule,
  ],
  providers: [CUSTOM_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-container">
        <span class="p-input-icon-left w-full md:w-30rem">
            <i class="pi pi-search"></i>
            <p-autoComplete
                [suggestions]="suggestions"
                (completeMethod)="onQueryChange($event)"
                (keyup)="onManualKeyup()"
                [(ngModel)]="value"
                (onSelect)="onItemSelect($event)"
                (onClear)="clearSearch()"
                (onBlur)="onTouched()"
                placeholder="Buscar Pokémon por nombre..."
                [dropdown]="true"
                class="w-full"
            ></p-autoComplete>
        </span>
    </div>
  `
})
export class SearcherComponent implements ControlValueAccessor, OnInit, OnDestroy {
  value: any = '';
  onChange: any = () => { };
  onTouched: any = () => { };

  suggestions: string[] = [];
  @Output() search = new EventEmitter<string>();

  private searchTerms = new BehaviorSubject<string>('');
  private subscription: Subscription = new Subscription();

  constructor(
    private detailService: PokemonDetailService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.subscription = this.searchTerms.pipe(
      debounceTime(0),
      distinctUntilChanged(),
      switchMap((query: string) => {

        if (!query) {
          this.ngZone.run(() => {
            this.suggestions = [];
            this.cdr.detectChanges();
          });
          return EMPTY;
        }
        return this.detailService.searchPokemonNames(query);
      })
    )
      .subscribe({
        next: (names: string[]) => {
          this.ngZone.run(() => {
            this.suggestions = [...names];

            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          console.error('Error fetching suggestions:', err);
          this.ngZone.run(() => {
            this.suggestions = [];
            this.cdr.detectChanges();
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  writeValue(value: any): void { this.value = value; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  onQueryChange(event: any) {
    this.searchTerms.next(event.query);
  }

  onManualKeyup(): void {
    this.cdr.detectChanges();
    this.searchTerms.next(this.value);
  }

  onItemSelect(event: any): void {
    this.onChange(event.value);
    this.search.emit(event.value);
  }

  clearSearch(): void {
    this.onChange('');
    this.search.emit('');
  }
}
