import { Component, signal, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
  selector: 'app-searcher',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    StyleClassModule
  ],
  templateUrl: '../searcher/searcherComponent.html'
})
export class SearcherComponent implements OnInit, OnDestroy {

  searchQuery = signal<string>('');

  @Output() search = new EventEmitter<string>();

  private searchTerms = new Subject<string>();
  private subscription!: Subscription;

  ngOnInit(): void {
    this.subscription = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.search.emit(term);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  onSearchChange(model: string): void {
    this.searchQuery.set(model);
    this.searchTerms.next(model);
  }
}
