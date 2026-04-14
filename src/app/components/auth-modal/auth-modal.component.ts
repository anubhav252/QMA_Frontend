import { Component, Input, Output, EventEmitter, OnInit, OnChanges, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { StateService } from '../../services/state.service';

declare var google: any;

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal" [class.show]="isOpen">
      <div class="modal-overlay" (click)="close.emit()"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ mode === 'login' ? 'Login' : 'Register' }}</h2>
          <button class="btn btn-ghost icon-btn" (click)="close.emit()">✕</button>
        </div>
        <p class="modal-sub">Access history &amp; save your work</p>

        <div class="tab-row">
          <button class="tab" [class.active]="mode === 'login'" (click)="mode = 'login'">Login</button>
          <button class="tab" [class.active]="mode === 'register'" (click)="mode = 'register'">Register</button>
        </div>

        <div class="field-group">
          <label>Username</label>
          <input type="text" [(ngModel)]="username" placeholder="Enter username">
        </div>
        <div class="field-group">
          <label>Password</label>
          <input type="password" [(ngModel)]="password" placeholder="Enter password">
        </div>

        <button class="btn btn-primary btn-full" [disabled]="loading" (click)="submit()">
          {{ loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Register') }}
        </button>

        <div class="auth-divider"><span>or</span></div>

        <div style="display:flex;justify-content:center;">
          <div id="g_id_signin"></div>
        </div>
      </div>
    </div>
  `
})
export class AuthModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  mode: 'login' | 'register' = 'login';
  username = '';
  password = '';
  loading = false;
  private isBrowser: boolean;

  constructor(
    private authService: AuthService,
    private state: StateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) return;
    (window as any)['handleGoogleCredential'] = (response: any) => {
      this.handleGoogle(response);
    };

    // Initialize Google once script is ready
    this.waitForGoogle();
  }

  ngOnChanges() {
    if (this.isOpen && this.isBrowser) {
      setTimeout(() => this.renderGoogleButton(), 500);
    }
  }

  waitForGoogle() {
    if (typeof google !== 'undefined') {
      this.initGoogle();
    } else {
      setTimeout(() => this.waitForGoogle(), 200);
    }
  }

  initGoogle() {
    if (typeof google === 'undefined') return;
    google.accounts.id.initialize({
      client_id: '743654690095-ic44m7ajtblkk4h2nd23qvlthmn1k5ri.apps.googleusercontent.com',
      callback: (window as any)['handleGoogleCredential']
    });
  }

  renderGoogleButton() {
    if (!this.isBrowser || typeof google === 'undefined') {
      setTimeout(() => this.renderGoogleButton(), 300);
      return;
    }
    const el = document.getElementById('g_id_signin');
    if (!el) return;
    el.innerHTML = ''; // clear previous render
    google.accounts.id.renderButton(el, {
      theme: 'outline',
      size: 'large',
      width: '320',
      text: 'continue_with',
      shape: 'rectangular'
    });
  }

  submit() {
    if (!this.username || !this.password) {
      return this.state.showToast('Fill in all fields', 'error');
    }
    this.loading = true;

    if (this.mode === 'login') {
      this.authService.login(this.username, this.password).subscribe({
        next: () => {
          this.loading = false;
          this.close.emit();
          this.state.showToast('Logged in successfully!');
        },
        error: () => {
          this.loading = false;
          this.state.showToast('Invalid credentials', 'error');
        }
      });
    } else {
      this.authService.register(this.username, this.password).subscribe({
        next: () => {
          this.loading = false;
          this.mode = 'login';
          this.state.showToast('Registered! Please log in.');
        },
        error: () => {
          this.loading = false;
          this.state.showToast('Registration failed', 'error');
        }
      });
    }
  }

  handleGoogle(response: any) {
    this.authService.googleLogin(response.credential).subscribe({
      next: () => {
        this.close.emit();
        this.state.showToast('Signed in with Google!');
      },
      error: () => this.state.showToast('Google sign-in failed', 'error')
    });
  }
}