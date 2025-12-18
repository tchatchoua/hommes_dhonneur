import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner,
  IonNote
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logInOutline, personAddOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    IonSpinner,
    IonNote
  ],
  template: `
    <ion-content class="ion-padding">
      <div class="login-container">
        <div class="logo-section">
          <h1>Community Finance Tracker</h1>
          <p>Manage your community's finances with ease</p>
        </div>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Sign In</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <ion-item>
                <ion-input
                  formControlName="usernameOrEmail"
                  type="text"
                  label="Username or Email"
                  labelPlacement="floating"
                  placeholder="Enter your username or email"
                ></ion-input>
              </ion-item>
              @if (loginForm.get('usernameOrEmail')?.invalid && loginForm.get('usernameOrEmail')?.touched) {
                <ion-note color="danger" class="ion-padding-start">
                  Username or email is required
                </ion-note>
              }

              <ion-item>
                <ion-input
                  formControlName="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  label="Password"
                  labelPlacement="floating"
                  placeholder="Enter your password"
                ></ion-input>
                <ion-button fill="clear" slot="end" (click)="togglePassword()">
                  <ion-icon [name]="showPassword() ? 'eye-off-outline' : 'eye-outline'"></ion-icon>
                </ion-button>
              </ion-item>
              @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                <ion-note color="danger" class="ion-padding-start">
                  Password is required
                </ion-note>
              }

              @if (errorMessage()) {
                <ion-text color="danger">
                  <p class="error-message">{{ errorMessage() }}</p>
                </ion-text>
              }

              <ion-button
                type="submit"
                expand="block"
                [disabled]="loginForm.invalid || isLoading()"
                class="ion-margin-top"
              >
                @if (isLoading()) {
                  <ion-spinner name="crescent"></ion-spinner>
                } @else {
                  <ion-icon slot="start" name="log-in-outline"></ion-icon>
                  Sign In
                }
              </ion-button>
            </form>

            <div class="register-link ion-text-center ion-margin-top">
              <p>Don't have an account?</p>
              <ion-button fill="clear" routerLink="/auth/register">
                <ion-icon slot="start" name="person-add-outline"></ion-icon>
                Create Account
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 0 auto;
      padding-top: 40px;
    }

    .logo-section {
      text-align: center;
      margin-bottom: 32px;

      h1 {
        font-size: 24px;
        font-weight: 700;
        color: var(--ion-color-primary);
        margin-bottom: 8px;
      }

      p {
        color: var(--ion-color-medium);
      }
    }

    ion-card {
      margin: 0;
    }

    ion-card-title {
      text-align: center;
    }

    ion-item {
      --padding-start: 0;
      margin-bottom: 8px;
    }

    .error-message {
      text-align: center;
      margin: 16px 0;
    }

    .register-link {
      margin-top: 24px;
      
      p {
        margin-bottom: 8px;
        color: var(--ion-color-medium);
      }
    }
  `]
})
export class LoginPage {
  loginForm: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    addIcons({ logInOutline, personAddOutline, eyeOutline, eyeOffOutline });

    this.loginForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.errorMessage.set(response.message || 'Login failed');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Login failed');
      }
    });
  }
}
