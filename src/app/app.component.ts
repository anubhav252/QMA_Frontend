import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { CategoryComponent } from './components/category/category.component';
import { ActionComponent } from './components/action/action.component';
import { InputAreaComponent } from './components/input-area/input-area.component';
import { ResultComponent } from './components/result/result.component';
import { HistoryModalComponent } from './components/history-modal/history-modal.component';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';
import { AuthService } from './services/auth.service';
import { StateService } from './services/state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    CategoryComponent,
    ActionComponent,
    InputAreaComponent,
    ResultComponent,
    HistoryModalComponent,
    AuthModalComponent
  ],
  template: `
    <div id="toastContainer">
      <div *ngIf="toast" class="toast" [class.success]="toast.type === 'success'" [class.error]="toast.type === 'error'">
        {{ toast.msg }}
      </div>
    </div>

    <app-header />

    <main class="main">
      <section class="section">
        <p class="section-label">Select Category</p>
        <app-category />
      </section>

      <section class="section">
        <p class="section-label">Choose Action</p>
        <app-action />
      </section>

      <section class="section">
        <p class="section-label">Enter Values</p>
        <app-input-area />
      </section>

      <app-result />

      <div class="history-trigger" (click)="openHistory()">
        <span>📊</span> View History
      </div>
    </main>

    <app-history-modal [isOpen]="historyOpen" (close)="historyOpen = false" />
    <app-auth-modal [isOpen]="authOpen" (close)="authOpen = false" />
  `
})
export class AppComponent implements OnInit {
  historyOpen = false;
  authOpen = false;
  toast: { msg: string; type: string } | null = null;

  constructor(private authService: AuthService, private state: StateService) {}

  ngOnInit() {
    this.authService.authModal$.subscribe(open => this.authOpen = open);
    this.state.historyModal.subscribe(open => this.historyOpen = open);
    this.state.toast.subscribe(t => this.toast = t);
  }

  openHistory() {
    if (!this.authService.getToken()) {
      this.authService.requestAuth();
      this.state.showToast('Login to view history', 'error');
      return;
    }
    this.state.openHistory();
  }
}