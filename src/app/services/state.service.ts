import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StateService {

  readonly units: Record<string, string[]> = {
    Length:      ['Feet', 'Inch', 'Yard', 'Centimeter'],
    Volume:      ['Litre', 'Millilitre', 'Gallon'],
    Temperature: ['Celsius', 'Fahrenheit', 'Kelvin'],
    Weight:      ['Kilogram', 'Gram', 'Pound']
  };

  readonly categoryIcons: Record<string, string> = {
    Length: '📏', Weight: '⚖️', Temperature: '🌡️', Volume: '🧪'
  };

  readonly categoryColors: Record<string, string> = {
    Length: '#6c63ff', Weight: '#22c55e', Temperature: '#f97316', Volume: '#06b6d4'
  };

  private category$ = new BehaviorSubject<string>('Length');
  private action$ = new BehaviorSubject<string>('compare');
  private operation$ = new BehaviorSubject<string>('add');
  private result$ = new BehaviorSubject<{ title: string; value: string; icon: string } | null>(null);
  private historyModal$ = new BehaviorSubject<boolean>(false);
  private toast$ = new BehaviorSubject<{ msg: string; type: string } | null>(null);

  selectedCategory$ = this.category$.asObservable();
  selectedAction$ = this.action$.asObservable();
  selectedOperation$ = this.operation$.asObservable();
  result = this.result$.asObservable();
  historyModal = this.historyModal$.asObservable();
  toast = this.toast$.asObservable();

  get category() { return this.category$.value; }
  get action() { return this.action$.value; }
  get operation() { return this.operation$.value; }

  setCategory(cat: string) {
    if (cat === 'Temperature' && this.action$.value === 'arithmetic') {
      this.action$.next('compare');
    }
    this.category$.next(cat);
  }

  setAction(action: string) { this.action$.next(action); }
  setOperation(op: string) { this.operation$.next(op); }

  showResult(title: string, value: string, icon: string) {
    this.result$.next({ title, value, icon });
  }

  clearResult() { this.result$.next(null); }

  openHistory() { this.historyModal$.next(true); }
  closeHistory() { this.historyModal$.next(false); }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toast$.next({ msg, type });
    setTimeout(() => this.toast$.next(null), 3000);
  }
}