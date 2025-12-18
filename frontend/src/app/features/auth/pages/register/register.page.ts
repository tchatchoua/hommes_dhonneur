import { Component, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import {
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
  IonNote,
  IonDatetime,
  IonDatetimeButton,
  IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAddOutline, logInOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
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
    IonNote,
    IonDatetime,
    IonDatetimeButton,
    IonModal
  ],
  template: `
    <ion-content class="ion-padding">
      <div class="register-container">
        <div class="logo-section">
          <h1>Les Hommes D'honneur</h1>
          <p>Create your account</p>
        </div>

        @if (invitationValid() === false) {
          <ion-card color="danger">
            <ion-card-content>
              <ion-text>
                <p>Invalid or expired invitation token. Please contact an administrator for a new invitation.</p>
              </ion-text>
              <ion-button fill="clear" routerLink="/auth/login">
                Back to Login
              </ion-button>
            </ion-card-content>
          </ion-card>
        } @else {
          <ion-card>
            <ion-card-header>
              <ion-card-title>Create Account</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                <div class="form-row">
                  <ion-item>
                    <ion-input
                      formControlName="firstName"
                      type="text"
                      label="First Name"
                      labelPlacement="floating"
                      placeholder="Enter first name"
                    ></ion-input>
                  </ion-item>

                  <ion-item>
                    <ion-input
                      formControlName="lastName"
                      type="text"
                      label="Last Name"
                      labelPlacement="floating"
                      placeholder="Enter last name"
                    ></ion-input>
                  </ion-item>
                </div>

                <ion-item>
                  <ion-input
                    formControlName="email"
                    type="email"
                    label="Email"
                    labelPlacement="floating"
                    placeholder="Enter your email"
                  ></ion-input>
                </ion-item>
                @if (registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched) {
                  <ion-note color="danger" class="ion-padding-start">
                    Please enter a valid email
                  </ion-note>
                }

                <ion-item>
                  <ion-input
                    formControlName="username"
                    type="text"
                    label="Username"
                    labelPlacement="floating"
                    placeholder="Choose a username"
                  ></ion-input>
                </ion-item>
                @if (registerForm.get('username')?.hasError('minlength') && registerForm.get('username')?.touched) {
                  <ion-note color="danger" class="ion-padding-start">
                    Username must be at least 3 characters
                  </ion-note>
                }

                <ion-item>
                  <ion-input
                    formControlName="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    label="Password"
                    labelPlacement="floating"
                    placeholder="Create a password"
                  ></ion-input>
                  <ion-button fill="clear" slot="end" (click)="togglePassword()">
                    <ion-icon [name]="showPassword() ? 'eye-off-outline' : 'eye-outline'"></ion-icon>
                  </ion-button>
                </ion-item>
                @if (registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched) {
                  <ion-note color="danger" class="ion-padding-start">
                    Password must be at least 8 characters
                  </ion-note>
                }

                <ion-item>
                  <ion-label>Date of Birth</ion-label>
                  <ion-datetime-button datetime="dob"></ion-datetime-button>
                </ion-item>
                <ion-modal [keepContentsMounted]="true">
                  <ng-template>
                    <ion-datetime
                      id="dob"
                      presentation="date"
                      [max]="maxDate"
                      (ionChange)="onDateChange($event)"
                    ></ion-datetime>
                  </ng-template>
                </ion-modal>
                @if (registerForm.get('dateOfBirth')?.hasError('required') && registerForm.get('dateOfBirth')?.touched) {
                  <ion-note color="danger" class="ion-padding-start">
                    Date of birth is required
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
                  [disabled]="registerForm.invalid || isLoading()"
                  class="ion-margin-top"
                >
                  @if (isLoading()) {
                    <ion-spinner name="crescent"></ion-spinner>
                  } @else {
                    <ion-icon slot="start" name="person-add-outline"></ion-icon>
                    Create Account
                  }
                </ion-button>
              </form>

              <div class="login-link ion-text-center ion-margin-top">
                <p>Already have an account?</p>
                <ion-button fill="clear" routerLink="/auth/login">
                  <ion-icon slot="start" name="log-in-outline"></ion-icon>
                  Sign In
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .register-container {
      max-width: 500px;
      margin: 0 auto;
      padding-top: 20px;
    }

    .logo-section {
      text-align: center;
      margin-bottom: 24px;

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

    .form-row {
      display: flex;
      gap: 8px;

      ion-item {
        flex: 1;
      }
    }

    ion-item {
      --padding-start: 0;
      margin-bottom: 8px;
    }

    .error-message {
      text-align: center;
      margin: 16px 0;
    }

    .login-link {
      margin-top: 24px;
      
      p {
        margin-bottom: 8px;
        color: var(--ion-color-medium);
      }
    }
  `]
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');
  invitationValid = signal<boolean | null>(null);
  invitationToken = '';
  maxDate: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    addIcons({ personAddOutline, logInOutline, eyeOutline, eyeOffOutline });

    // Max date is 13 years ago
    const date = new Date();
    date.setFullYear(date.getFullYear() - 13);
    this.maxDate = date.toISOString();

    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      dateOfBirth: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.invitationToken = this.route.snapshot.queryParams['token'] || '';
    
    if (this.invitationToken) {
      this.authService.validateInvitation(this.invitationToken).subscribe({
        next: (response) => {
          this.invitationValid.set(response.data ?? false);
        },
        error: () => {
          this.invitationValid.set(false);
        }
      });
    } else {
      this.invitationValid.set(true);
    }
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onDateChange(event: any): void {
    const value = event.detail.value;
    if (value) {
      this.registerForm.patchValue({ dateOfBirth: value });
      this.registerForm.get('dateOfBirth')?.markAsTouched();
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const request = {
      ...this.registerForm.value,
      invitationToken: this.invitationToken || undefined
    };

    this.authService.register(request).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage.set(response.message || 'Registration failed');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Registration failed');
      }
    });
  }
}
