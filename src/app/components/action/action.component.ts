import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-action',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="action-grid">
      <div
        class="action-card"
        [class.active]="selectedAction === 'compare'"
        (click)="select('compare')">
        <div class="action-icon">⚖️</div>
        <div class="action-label">Compare</div>
        <div class="action-sub">Check equality</div>
      </div>
      <div
        class="action-card"
        [class.active]="selectedAction === 'convert'"
        (click)="select('convert')">
        <div class="action-icon">🔄</div>
        <div class="action-label">Convert</div>
        <div class="action-sub">Change units</div>
      </div>
      <div
        class="action-card"
        *ngIf="selectedCategory !== 'Temperature'"
        [class.active]="selectedAction === 'arithmetic'"
        (click)="select('arithmetic')">
        <div class="action-icon">🧮</div>
        <div class="action-label">Arithmetic</div>
        <div class="action-sub">Add, subtract, divide</div>
      </div>
    </div>
  `
})
export class ActionComponent implements OnInit {
  selectedAction = 'compare';
  selectedCategory = 'Length';

  constructor(private state: StateService) {}

  ngOnInit() {
    this.state.selectedAction$.subscribe(a => this.selectedAction = a);
    this.state.selectedCategory$.subscribe(c => this.selectedCategory = c);
  }

  select(action: string) {
    this.state.setAction(action);
    this.state.clearResult();
  }
}