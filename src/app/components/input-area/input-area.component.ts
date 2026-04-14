import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { QuantityService } from '../../services/quantity.service';

@Component({
  selector: 'app-input-area',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="input-panel">

      <!-- CONVERT -->
      <ng-container *ngIf="action === 'convert'">
        <div class="field-group">
          <label>Value to convert</label>
          <input type="number" [(ngModel)]="v1" placeholder="e.g. 100">
        </div>
        <div class="input-row">
          <div>
            <label>From</label>
            <select [(ngModel)]="fromUnit">
              <option *ngFor="let u of units" [value]="u">{{ u }}</option>
            </select>
          </div>
          <div>
            <label>To</label>
            <select [(ngModel)]="toUnit">
              <option *ngFor="let u of units" [value]="u">{{ u }}</option>
            </select>
          </div>
        </div>
        <div class="submit-row">
          <button class="btn btn-primary" (click)="convert()">Convert →</button>
        </div>
      </ng-container>

      <!-- COMPARE -->
      <ng-container *ngIf="action === 'compare'">
        <div class="input-row">
          <div>
            <label>First value</label>
            <input type="number" [(ngModel)]="v1" placeholder="e.g. 10">
          </div>
          <div>
            <label>Unit</label>
            <select [(ngModel)]="unit1">
              <option *ngFor="let u of units" [value]="u">{{ u }}</option>
            </select>
          </div>
        </div>
        <div class="divider">vs</div>
        <div class="input-row">
          <div>
            <label>Second value</label>
            <input type="number" [(ngModel)]="v2" placeholder="e.g. 10">
          </div>
          <div>
            <label>Unit</label>
            <select [(ngModel)]="unit2">
              <option *ngFor="let u of units" [value]="u">{{ u }}</option>
            </select>
          </div>
        </div>
        <div class="submit-row">
          <button class="btn btn-primary" (click)="execute()">Compare →</button>
        </div>
      </ng-container>

      <!-- ARITHMETIC -->
      <ng-container *ngIf="action === 'arithmetic'">
        <div class="op-row">
          <button class="op-btn" [class.active]="operation === 'add'" (click)="setOp('add')">+ Add</button>
          <button class="op-btn" [class.active]="operation === 'subtract'" (click)="setOp('subtract')">− Subtract</button>
          <button class="op-btn" [class.active]="operation === 'divide'" (click)="setOp('divide')">÷ Divide</button>
        </div>
        <div class="input-row">
          <div>
            <label>First value</label>
            <input type="number" [(ngModel)]="v1" placeholder="e.g. 10">
          </div>
          <div>
            <label>Unit</label>
            <select [(ngModel)]="unit1">
              <option *ngFor="let u of units" [value]="u">{{ u }}</option>
            </select>
          </div>
        </div>
        <div class="divider">{{ operation === 'add' ? '+' : operation === 'subtract' ? '−' : '÷' }}</div>
        <div class="input-row">
          <div>
            <label>Second value</label>
            <input type="number" [(ngModel)]="v2" placeholder="e.g. 5">
          </div>
          <div>
            <label>Unit</label>
            <select [(ngModel)]="unit2">
              <option *ngFor="let u of units" [value]="u">{{ u }}</option>
            </select>
          </div>
        </div>
        <div class="field-group" *ngIf="operation !== 'divide'">
          <label>Result unit (optional)</label>
          <select [(ngModel)]="targetUnit">
            <option value="">Same as second</option>
            <option *ngFor="let u of units" [value]="u">{{ u }}</option>
          </select>
        </div>
        <div class="submit-row">
          <button class="btn btn-primary" (click)="execute()">Calculate →</button>
        </div>
      </ng-container>

    </div>
  `
})
export class InputAreaComponent implements OnInit {
  action = 'compare';
  operation = 'add';
  category = 'Length';
  units: string[] = [];

  v1: number | null = null;
  v2: number | null = null;
  fromUnit = '';
  toUnit = '';
  unit1 = '';
  unit2 = '';
  targetUnit = '';

  constructor(private state: StateService, private quantityService: QuantityService) {}

  ngOnInit() {
    this.state.selectedAction$.subscribe(a => { this.action = a; this.resetInputs(); });
    this.state.selectedOperation$.subscribe(op => this.operation = op);
    this.state.selectedCategory$.subscribe(cat => {
      this.category = cat;
      this.units = this.state.units[cat];
      this.resetUnits();
    });
  }

  resetInputs() {
    this.v1 = null;
    this.v2 = null;
    this.targetUnit = '';
  }

  resetUnits() {
    this.fromUnit = this.units[0];
    this.toUnit = this.units.length > 1 ? this.units[1] : this.units[0];
    this.unit1 = this.units[0];
    this.unit2 = this.units[0];
  }

  setOp(op: string) {
    this.state.setOperation(op);
  }

  convert() {
    if (this.v1 === null) return this.state.showToast('Please enter a value', 'error');
    this.quantityService.convert({
      input: { value: this.v1, unit: this.fromUnit, category: this.category },
      targetUnit: this.toUnit
    }).subscribe({
      next: d => this.state.showResult('Conversion Result', `${this.v1} ${this.fromUnit} = ${d.value} ${d.unit}`, '🔄'),
      error: () => this.state.showToast('Conversion failed', 'error')
    });
  }

  execute() {
    if (this.v1 === null || this.v2 === null) return this.state.showToast('Enter both values', 'error');

    const type = this.action === 'arithmetic' ? this.operation : this.action;
    const first = { value: this.v1, unit: this.unit1, category: this.category };
    const second = { value: this.v2, unit: this.unit2, category: this.category };

    const labels: Record<string, string> = {
      compare: 'Comparison Result', divide: 'Division Result',
      add: 'Addition Result', subtract: 'Subtraction Result'
    };
    const icons: Record<string, string> = {
      compare: '⚖️', divide: '÷', add: '+', subtract: '−'
    };

    const handler = (d: any) => {
      let text = '';
      if (type === 'compare') text = d.message || (d.resultValue === 1 ? 'Equal ✓' : 'Not Equal ✗');
      else if (type === 'divide') text = `${d.BaseValue ?? d.baseValue}`;
      else text = `${d.value} ${d.unit}`;
      this.state.showResult(labels[type], text, icons[type]);
    };

    const err = () => this.state.showToast('Operation failed', 'error');

    if (type === 'compare') this.quantityService.compare({ first, second }).subscribe({ next: handler, error: err });
    else if (type === 'divide') this.quantityService.divide({ first, second }).subscribe({ next: handler, error: err });
    else if (type === 'add') this.quantityService.add({ first, second, targetUnit: this.targetUnit || this.unit2 }).subscribe({ next: handler, error: err });
    else if (type === 'subtract') this.quantityService.subtract({ first, second, targetUnit: this.targetUnit || this.unit2 }).subscribe({ next: handler, error: err });
  }
}