import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';

export type SortDirection = 'asc' | 'desc' | 'default';

@Component({
  selector: 'app-sorter',
  standalone: true,
  imports: [CommonModule, ButtonModule, FormsModule, TooltipModule],
  templateUrl: '../sorter/sorterComponent.html',
})

export class SorterComponent {

  @Input() currentDirection: SortDirection = 'default';
  @Output() sortChange = new EventEmitter<SortDirection>();

  onClick(direction: 'asc' | 'desc'): void {
    let newDirection: SortDirection;

    if (this.currentDirection === direction) {
      newDirection = 'default';
    } else {
      newDirection = direction;
    }

    this.sortChange.emit(newDirection);
  }
}
