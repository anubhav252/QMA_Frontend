import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuantityService } from '../../services/quantity.service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-history-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal" [class.show]="isOpen">
      <div class="modal-overlay" (click)="close.emit()"></div>
      <div class="modal-content modal-wide">
        <div class="modal-header">
          <h2>Operation History</h2>
          <div style="display:flex;gap:8px">
            <button class="btn btn-danger-ghost" (click)="clearHistory()">Clear All</button>
            <button class="btn btn-ghost icon-btn" (click)="close.emit()">✕</button>
          </div>
        </div>

        <div class="history-list">
          <div class="empty-state" *ngIf="loading">Loading...</div>
          <div class="empty-state" *ngIf="!loading && items.length === 0">No history yet. Start calculating!</div>

          <div class="history-item" *ngFor="let item of items">
            <div class="history-op">{{ item.op }}</div>
            <div class="history-vals">{{ item.from }} · {{ item.to }}</div>
            <div class="history-result">= {{ item.result }}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HistoryModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  loading = false;
  items: { op: string; from: string; to: string; result: string }[] = [];

  constructor(
    private quantityService: QuantityService,
    private state: StateService
  ) {}

  ngOnChanges() {
    if (this.isOpen) this.load();
  }

  load() {
    this.loading = true;
    this.quantityService.getHistory().subscribe({
      next: (data: any) => {
        this.loading = false;

        // Handle both PascalCase and camelCase responses from backend
        const operations = data.operations ?? data.Operations ?? [];
        const quantities = data.quantities ?? data.Quantities ?? [];

        if (!operations.length) {
          this.items = [];
          return;
        }

        this.items = operations.map((op: any) => {
          // Handle both PascalCase and camelCase field names
          const firstId  = op.firstQuantityId  ?? op.FirstQuantityId;
          const secondId = op.secondQuantityId ?? op.SecondQuantityId;
          const opType   = op.operationType    ?? op.OperationType ?? '';
          const resValue = op.resultValue      ?? op.ResultValue;
          const resUnit  = op.resultUnit       ?? op.ResultUnit ?? '';

          const f = quantities.find((q: any) =>
            (q.id ?? q.Id) === firstId
          );
          const s = quantities.find((q: any) =>
            (q.id ?? q.Id) === secondId
          );

          let result = '';
          const opLower = opType.toLowerCase();
          if (opLower === 'compare') {
            result = resValue === 1 ? 'Equal' : 'Not Equal';
          } else if (opLower === 'divide' || opLower === 'division') {
            result = `${resValue}`;
          } else {
            result = `${resValue} ${resUnit}`;
          }

          return {
            op: opType,
            from: `${f?.value ?? f?.Value ?? '?'} ${f?.unit ?? f?.Unit ?? ''}`,
            to:   `${s?.value ?? s?.Value ?? '?'} ${s?.unit ?? s?.Unit ?? ''}`,
            result
          };
        });
      },
      error: (err) => {
        this.loading = false;
        console.error('History error:', err);
        this.state.showToast('Failed to load history', 'error');
      }
    });
  }

  clearHistory() {
    this.quantityService.clearHistory().subscribe({
      next: () => {
        this.items = [];
        this.state.showToast('History cleared');
      },
      error: () => this.state.showToast('Failed to clear history', 'error')
    });
  }
}