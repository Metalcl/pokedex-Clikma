import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { PaginatorState } from 'primeng/paginator';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { SortDirection } from '../sorter/sorterComponent';

@Component({
  selector: 'app-table-display',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule],
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

  @Output() search = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<SortDirection>();
  @Output() pageChange = new EventEmitter<PaginatorState>();

  onPageChange(event: PaginatorState) {
    this.pageChange.emit(event);
  }

  getPokemonId(url: string): string {
    if (!url) return '#?';
    const segments = url.split('/').filter(segment => segment);
    return segments.pop() || '#?';
  }
}
