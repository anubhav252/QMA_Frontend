import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-grid">
      <div
        *ngFor="let cat of categories"
        class="cat-card"
        [class.active]="selectedCategory === cat"
        [style.borderColor]="selectedCategory === cat ? colors[cat] : ''"
        [style.background]="selectedCategory === cat ? colors[cat] + '18' : ''"
        (click)="select(cat)">
        <div class="cat-emoji">{{ icons[cat] }}</div>
        <div class="cat-name">{{ cat }}</div>
      </div>
    </div>
  `
})
export class CategoryComponent implements OnInit {
  categories: string[] = [];
  icons: Record<string, string> = {};
  colors: Record<string, string> = {};
  selectedCategory = 'Length';

  constructor(private state: StateService) {}

  ngOnInit() {
    this.categories = Object.keys(this.state.units);
    this.icons = this.state.categoryIcons;
    this.colors = this.state.categoryColors;
    this.state.selectedCategory$.subscribe(cat => this.selectedCategory = cat);
  }

  select(cat: string) {
    this.state.setCategory(cat);
    this.state.clearResult();
  }
}