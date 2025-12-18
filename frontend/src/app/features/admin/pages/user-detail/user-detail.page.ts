import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonBadge,
  IonButton,
  IonSpinner,
  IonButtons,
  IonBackButton,
  IonAvatar,
  IonSelect,
  IonSelectOption,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personOutline, 
  mailOutline,
  calendarOutline,
  cashOutline,
  walletOutline,
  shieldCheckmarkOutline,
  trashOutline
} from 'ionicons/icons';
import { UserService } from '@core/services/user.service';
import { User } from '@core/models/models';

@Component({
  selector: 'app-admin-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonBadge,
    IonButton,
    IonSpinner,
    IonButtons,
    IonBackButton,
    IonAvatar,
    IonSelect,
    IonSelectOption
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/admin/users"></ion-back-button>
        </ion-buttons>
        <ion-title>User Details</ion-title>
        <ion-buttons slot="end">
          <ion-button color="danger" (click)="confirmDelete()">
            <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (isLoading()) {
        <div class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
        </div>
      } @else if (!user()) {
        <div class="empty-state">
          <ion-icon name="person-outline"></ion-icon>
          <h3>User Not Found</h3>
        </div>
      } @else {
        <ion-card class="profile-card">
          <ion-card-content>
            <div class="profile-header">
              <ion-avatar>
                <img [src]="user()?.photoUrl || 'https://ionicframework.com/docs/img/demos/avatar.svg'" alt="Avatar" />
              </ion-avatar>
              <h2>{{ user()?.firstName }} {{ user()?.lastName }}</h2>
              <p>&#64;{{ user()?.username }}</p>
              <ion-badge [color]="user()?.role === 'Admin' ? 'primary' : 'medium'">
                {{ user()?.role }}
              </ion-badge>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>User Information</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-icon name="mail-outline" slot="start"></ion-icon>
                <ion-label>
                  <p>Email</p>
                  <h3>{{ user()?.email }}</h3>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-icon name="calendar-outline" slot="start"></ion-icon>
                <ion-label>
                  <p>Date of Birth</p>
                  <h3>{{ user()?.dateOfBirth | date:'mediumDate' }}</h3>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-icon name="calendar-outline" slot="start"></ion-icon>
                <ion-label>
                  <p>Member Since</p>
                  <h3>{{ user()?.createdAt | date:'mediumDate' }}</h3>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Role Management</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-select
                [(ngModel)]="selectedRole"
                label="User Role"
                labelPlacement="floating"
                (ionChange)="updateRole()"
              >
                <ion-select-option value="User">User</ion-select-option>
                <ion-select-option value="Admin">Admin</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Financial Summary</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-icon name="cash-outline" slot="start" color="success"></ion-icon>
                <ion-label>
                  <p>Total Contributions</p>
                  <h3>{{ userStats().totalContributions | currency }}</h3>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-icon name="wallet-outline" slot="start" color="danger"></ion-icon>
                <ion-label>
                  <p>Total Debts</p>
                  <h3>{{ userStats().totalDebts | currency }}</h3>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-icon name="wallet-outline" slot="start" color="warning"></ion-icon>
                <ion-label>
                  <p>Pending Debts</p>
                  <h3>{{ userStats().pendingDebts | currency }}</h3>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      }
    </ion-content>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;

      ion-icon {
        font-size: 64px;
        color: var(--ion-color-medium);
        margin-bottom: 16px;
      }
    }

    .profile-card {
      text-align: center;
    }

    .profile-header {
      ion-avatar {
        width: 100px;
        height: 100px;
        margin: 0 auto 16px;
      }

      h2 {
        font-size: 24px;
        font-weight: 700;
        margin: 0 0 4px;
      }

      p {
        color: var(--ion-color-medium);
        margin: 0 0 12px;
      }
    }

    ion-card-header {
      ion-card-title {
        font-size: 16px;
      }
    }
  `]
})
export class AdminUserDetailPage implements OnInit {
  user = signal<User | null>(null);
  isLoading = signal(true);
  selectedRole = 'User';
  userStats = signal({ totalContributions: 0, totalDebts: 0, pendingDebts: 0 });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ 
      personOutline, 
      mailOutline,
      calendarOutline,
      cashOutline,
      walletOutline,
      shieldCheckmarkOutline,
      trashOutline
    });
  }

  ngOnInit(): void {
    const userId = this.route.snapshot.params['id'];
    if (userId) {
      this.loadUser(userId);
    }
  }

  loadUser(userId: number): void {
    this.isLoading.set(true);
    this.userService.getById(userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.user.set(response.data);
          this.selectedRole = response.data.role;
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  async updateRole(): Promise<void> {
    const user = this.user();
    if (!user) return;

    this.userService.updateRole(user.id, this.selectedRole).subscribe({
      next: async (response) => {
        if (response.success) {
          const toast = await this.toastController.create({
            message: 'User role updated',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
          this.loadUser(user.id);
        }
      },
      error: async () => {
        const toast = await this.toastController.create({
          message: 'Failed to update role',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  async confirmDelete(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteUser();
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteUser(): Promise<void> {
    const user = this.user();
    if (!user) return;

    this.userService.delete(user.id).subscribe({
      next: async (response) => {
        if (response.success) {
          const toast = await this.toastController.create({
            message: 'User deleted',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
          this.router.navigate(['/admin/users']);
        }
      },
      error: async () => {
        const toast = await this.toastController.create({
          message: 'Failed to delete user',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}
