import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="result-card" *ngIf="result">
      <div class="result-inner">
        <div class="result-icon">{{ result.icon }}</div>
        <div class="result-body">
          <p class="result-title">{{ result.title }}</p>
          <p class="result-value">{{ result.value }}</p>
        </div>
      </div>
    </div>
  `
})
export class ResultComponent implements OnInit {
  result: { title: string; value: string; icon: string } | null = null;

  constructor(private state: StateService) {}

  ngOnInit() {
    this.state.result.subscribe(r => this.result = r);
  }
}