import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
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
  IonAvatar,
  IonList,
  IonToggle,
  IonButtons,
  IonMenuButton,
  IonNote,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personOutline, 
  saveOutline, 
  notificationsOutline,
  mailOutline,
  callOutline,
  calendarOutline,
  walletOutline,
  trendingUpOutline,
  trendingDownOutline
} from 'ionicons/icons';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { NotificationService } from '@core/services/notification.service';
import { ContributionService } from '@core/services/contribution.service';
import { DebtService } from '@core/services/debt.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
    IonAvatar,
    IonList,
    IonToggle,
    IonButtons,
    IonMenuButton,
    IonNote
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>My Profile</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="profile-container">
        <ion-card class="profile-header-card">
          <ion-card-content>
            <div class="profile-avatar">
              <ion-avatar>
                <img [src]="currentUser()?.photoUrl || 'https://ionicframework.com/docs/img/demos/avatar.svg'" alt="Profile" />
              </ion-avatar>
            </div>
            <h2>{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</h2>
            <p>{{ currentUser()?.email }}</p>
            <p class="role-badge">{{ currentUser()?.role }}</p>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="person-outline"></ion-icon>
              Personal Information
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
              <div class="form-row">
                <ion-item>
                  <ion-input
                    formControlName="firstName"
                    type="text"
                    label="First Name"
                    labelPlacement="floating"
                  ></ion-input>
                </ion-item>

                <ion-item>
                  <ion-input
                    formControlName="lastName"
                    type="text"
                    label="Last Name"
                    labelPlacement="floating"
                  ></ion-input>
                </ion-item>
              </div>

              <ion-item>
                <ion-input
                  formControlName="email"
                  type="email"
                  label="Email"
                  labelPlacement="floating"
                  readonly
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-input
                  formControlName="username"
                  type="text"
                  label="Username"
                  labelPlacement="floating"
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-input
                  formControlName="phone"
                  type="tel"
                  label="Phone Number"
                  labelPlacement="floating"
                ></ion-input>
              </ion-item>

              @if (errorMessage()) {
                <ion-text color="danger">
                  <p class="error-message">{{ errorMessage() }}</p>
                </ion-text>
              }

              <ion-button
                type="submit"
                expand="block"
                [disabled]="profileForm.invalid || isSaving()"
                class="ion-margin-top"
              >
                @if (isSaving()) {
                  <ion-spinner name="crescent"></ion-spinner>
                } @else {
                  <ion-icon slot="start" name="save-outline"></ion-icon>
                  Save Changes
                }
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="notifications-outline"></ion-icon>
              Notification Preferences
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-toggle
                  [(ngModel)]="notificationSettings.emailNotifications"
                  (ionChange)="saveNotificationSettings()"
                >
                  Email Notifications
                </ion-toggle>
              </ion-item>
              <ion-item>
                <ion-toggle
                  [(ngModel)]="notificationSettings.pushNotifications"
                  (ionChange)="saveNotificationSettings()"
                >
                  Push Notifications
                </ion-toggle>
              </ion-item>
              <ion-item>
                <ion-toggle
                  [(ngModel)]="notificationSettings.contributionReminders"
                  (ionChange)="saveNotificationSettings()"
                >
                  Contribution Reminders
                </ion-toggle>
              </ion-item>
              <ion-item>
                <ion-toggle
                  [(ngModel)]="notificationSettings.debtReminders"
                  (ionChange)="saveNotificationSettings()"
                >
                  Debt Payment Reminders
                </ion-toggle>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .profile-container {
      max-width: 600px;
      margin: 0 auto;
    }

    .profile-header-card {
      text-align: center;

      ion-card-content {
        padding: 24px;
      }
    }

    .profile-avatar {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;

      ion-avatar {
        width: 100px;
        height: 100px;
      }
    }

    h2 {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 8px;
    }

    p {
      margin: 0 0 4px;
      color: var(--ion-color-medium);
    }

    .role-badge {
      display: inline-block;
      background: var(--ion-color-primary);
      color: white;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      margin-top: 8px;
    }

    ion-card-header {
      ion-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
      }
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

    /* Financial Summary Styles */
    .financial-summary-card {
      ion-card-content {
        padding: 16px;
      }
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 24px;
    }

    .financial-stats {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-radius: 12px;
      background: var(--ion-color-light);

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        ion-icon {
          font-size: 24px;
          color: white;
        }
      }

      .stat-details {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .stat-label {
        font-size: 12px;
        color: var(--ion-color-medium);
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 20px;
        font-weight: 700;
      }

      &.contributions {
        .stat-icon {
          background: linear-gradient(135deg, var(--ion-color-success), var(--ion-color-success-shade));
        }
        .stat-value {
          color: var(--ion-color-success);
        }
      }

      &.debts {
        .stat-icon {
          background: linear-gradient(135deg, var(--ion-color-danger), var(--ion-color-danger-shade));
        }
        .stat-value {
          color: var(--ion-color-danger);
        }
      }

      &.balance {
        .stat-icon {
          background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-primary-shade));
        }

        &.positive .stat-value {
          color: var(--ion-color-success);
        }

        &.negative .stat-value {
          color: var(--ion-color-danger);
        }
      }
    }
  `]
})
export class ProfilePage implements OnInit {
  profileForm: FormGroup;
  isSaving = signal(false);
  errorMessage = signal('');
  isLoadingFinancials = signal(true);
  totalContributions = signal(0);
  totalDebts = signal(0);
  netBalance = computed(() => this.totalContributions() - this.totalDebts());

  currentUser = computed(() => this.authService.currentUser());

  notificationSettings = {
    emailNotifications: true,
    pushNotifications: true,
    contributionReminders: true,
    debtReminders: true
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService,
    private contributionService: ContributionService,
    private debtService: DebtService,
    private toastController: ToastController
  ) {
    addIcons({ 
      personOutline, 
      saveOutline, 
      notificationsOutline,
      mailOutline,
      callOutline,
      calendarOutline,
      walletOutline,
      trendingUpOutline,
      trendingDownOutline
    });

    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      phoneNumber: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadNotificationSettings();
    this.loadFinancialSummary();
  }

  loadProfile(): void {
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        phoneNumber: user.phoneNumber || ''
      });
    }
  }

  loadFinancialSummary(): void {
    this.isLoadingFinancials.set(true);
    
    // Load contributions
    this.contributionService.getMyContributions().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const total = response.data.reduce((sum, c) => sum + c.amount, 0);
          this.totalContributions.set(total);
        }
        this.checkFinancialsLoaded();
      },
      error: () => {
        this.checkFinancialsLoaded();
      }
    });

    // Load debts
    this.debtService.getMyDebts().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const total = response.data.reduce((sum, d) => sum + d.amount, 0);
          this.totalDebts.set(total);
        }
        this.checkFinancialsLoaded();
      },
      error: () => {
        this.checkFinancialsLoaded();
      }
    });
  }

  private financialsLoaded = 0;
  private checkFinancialsLoaded(): void {
    this.financialsLoaded++;
    if (this.financialsLoaded >= 2) {
      this.isLoadingFinancials.set(false);
      this.financialsLoaded = 0;
    }
  }

  loadNotificationSettings(): void {
    this.notificationService.getSettings().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.notificationSettings = {
            emailNotifications: response.data.isEnabled,
            pushNotifications: response.data.isEnabled,
            contributionReminders: response.data.isEnabled,
            debtReminders: response.data.isEnabled
          };
        }
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    this.isSaving.set(true);
    this.errorMessage.set('');

    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: async (response) => {
        this.isSaving.set(false);
        if (response.success) {
          const toast = await this.toastController.create({
            message: 'Profile updated successfully',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
          
          // Refresh user data
          if (response.data) {
            this.authService.updateCurrentUser(response.data);
          }
        } else {
          this.errorMessage.set(response.message || 'Failed to update profile');
        }
      },
      error: (error) => {
        this.isSaving.set(false);
        this.errorMessage.set(error.message || 'Failed to update profile');
      }
    });
  }

  async saveNotificationSettings(): Promise<void> {
    this.notificationService.updateSettings({ isEnabled: this.notificationSettings.emailNotifications }).subscribe({
      next: async (response) => {
        if (response.success) {
          const toast = await this.toastController.create({
            message: 'Notification settings updated',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
        }
      }
    });
  }
}
