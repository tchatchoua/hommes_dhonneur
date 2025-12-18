import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonBadge,
  IonButton,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonButtons,
  IonMenuButton,
  IonFab,
  IonFabButton,
  IonModal,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  addOutline, 
  notificationsOutline,
  closeOutline,
  checkmarkDoneOutline,
  timeOutline
} from 'ionicons/icons';
import { NotificationService } from '@core/services/notification.service';
import { UserService } from '@core/services/user.service';
import { ApiResponse, PaginatedResponse } from '@core/models/auth.models';
import { Notification, User } from '@core/models/models';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonBadge,
    IonButton,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonButtons,
    IonMenuButton,
    IonFab,
    IonFabButton,
    IonModal,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonInfiniteScroll,
    IonInfiniteScrollContent
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Notifications</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      @if (isLoading() && notifications().length === 0) {
        <div class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading notifications...</p>
        </div>
      } @else if (notifications().length === 0) {
        <div class="empty-state">
          <ion-icon name="notifications-outline"></ion-icon>
          <h3>No Notifications</h3>
          <p>Send a notification to users</p>
          <ion-button (click)="openAddModal()">
            <ion-icon slot="start" name="add-outline"></ion-icon>
            Send Notification
          </ion-button>
        </div>
      } @else {
        <ion-list>
          @for (notification of notifications(); track notification.id) {
            <ion-item>
              <ion-icon 
                [name]="notification.isSent ? 'checkmark-done-outline' : 'time-outline'" 
                slot="start" 
                [color]="notification.isSent ? 'medium' : 'primary'"
              ></ion-icon>
              <ion-label>
                <h2>{{ notification.type }}</h2>
                <p>{{ notification.message }}</p>
                <p class="meta">
                  User ID: {{ notification.userId }} 
                  • {{ notification.notificationDate | date:'medium' }}
                </p>
              </ion-label>
              <ion-badge slot="end" [color]="getTypeColor(notification.type)">
                {{ notification.isSent ? 'Sent' : 'Pending' }}
              </ion-badge>
            </ion-item>
          }
        </ion-list>

        <ion-infinite-scroll (ionInfinite)="loadMore($event)">
          <ion-infinite-scroll-content></ion-infinite-scroll-content>
        </ion-infinite-scroll>
      }

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button (click)="openAddModal()">
          <ion-icon name="add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <ion-modal [isOpen]="isModalOpen()" (didDismiss)="closeModal()">
        <ng-template>
          <ion-header>
            <ion-toolbar>
              <ion-buttons slot="start">
                <ion-button (click)="closeModal()">
                  <ion-icon slot="icon-only" name="close-outline"></ion-icon>
                </ion-button>
              </ion-buttons>
              <ion-title>Send Notification</ion-title>
              <ion-buttons slot="end">
                <ion-button [disabled]="isSaving()" (click)="sendNotification()">
                  @if (isSaving()) {
                    <ion-spinner name="crescent"></ion-spinner>
                  } @else {
                    Send
                  }
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <ion-list>
              <ion-item>
                <ion-select
                  [(ngModel)]="notificationForm.userId"
                  label="Recipient"
                  labelPlacement="floating"
                  placeholder="Select user"
                >
                  <ion-select-option [value]="0">All Users</ion-select-option>
                  @for (user of users(); track user.id) {
                    <ion-select-option [value]="user.id">
                      {{ user.firstName }} {{ user.lastName }}
                    </ion-select-option>
                  }
                </ion-select>
              </ion-item>
              <ion-item>
                <ion-select
                  [(ngModel)]="notificationForm.type"
                  label="Type"
                  labelPlacement="floating"
                >
                  <ion-select-option value="Info">Info</ion-select-option>
                  <ion-select-option value="Warning">Warning</ion-select-option>
                  <ion-select-option value="Reminder">Reminder</ion-select-option>
                  <ion-select-option value="Alert">Alert</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item>
                <ion-input
                  [(ngModel)]="notificationForm.title"
                  type="text"
                  label="Title"
                  labelPlacement="floating"
                  placeholder="Enter title"
                ></ion-input>
              </ion-item>
              <ion-item>
                <ion-textarea
                  [(ngModel)]="notificationForm.message"
                  label="Message"
                  labelPlacement="floating"
                  placeholder="Enter message"
                  [rows]="4"
                ></ion-textarea>
              </ion-item>
            </ion-list>
          </ion-content>
        </ng-template>
      </ion-modal>
    </ion-content>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;

      p {
        margin-top: 16px;
        color: var(--ion-color-medium);
      }
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

      h3 {
        margin: 0 0 8px;
      }

      p {
        color: var(--ion-color-medium);
        margin: 0 0 24px;
      }
    }

    .meta {
      font-size: 12px;
      margin-top: 4px;
    }
  `]
})
export class AdminNotificationsPage implements OnInit {
  notifications = signal<Notification[]>([]);
  users = signal<User[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  isModalOpen = signal(false);

  currentPage = 1;
  pageSize = 20;
  hasMore = true;

  notificationForm = {
    userId: 0,
    type: 'Info',
    title: '',
    message: ''
  };

  constructor(
    private notificationService: NotificationService,
    private userService: UserService,
    private toastController: ToastController
  ) {
    addIcons({ 
      addOutline, 
      notificationsOutline,
      closeOutline,
      checkmarkDoneOutline,
      timeOutline
    });
  }

  ngOnInit(): void {
    this.loadNotifications();
    this.loadUsers();
  }

  loadNotifications(append = false): void {
    if (!append) {
      this.isLoading.set(true);
      this.currentPage = 1;
    }

    this.notificationService.getAll(this.currentPage, this.pageSize).subscribe({
      next: (response: ApiResponse<PaginatedResponse<Notification>>) => {
        if (response.success && response.data) {
          const items = response.data.items;
          if (append) {
            this.notifications.update(current => [...current, ...items]);
          } else {
            this.notifications.set(items);
          }
          this.hasMore = items.length === this.pageSize;
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (response: ApiResponse<User[]>) => {
        if (response.success && response.data) {
          this.users.set(response.data);
        }
      }
    });
  }

  loadMore(event: any): void {
    if (!this.hasMore) {
      event.target.complete();
      return;
    }

    this.currentPage++;
    this.notificationService.getAll(this.currentPage, this.pageSize).subscribe({
      next: (response: ApiResponse<PaginatedResponse<Notification>>) => {
        if (response.success && response.data) {
          const items = response.data.items;
          this.notifications.update(current => [...current, ...items]);
          this.hasMore = items.length === this.pageSize;
        }
        event.target.complete();
      },
      error: () => {
        event.target.complete();
      }
    });
  }

  refresh(event: any): void {
    this.loadNotifications();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'Warning': return 'warning';
      case 'Alert': return 'danger';
      case 'Reminder': return 'tertiary';
      default: return 'primary';
    }
  }

  openAddModal(): void {
    this.notificationForm = {
      userId: 0,
      type: 'Info',
      title: '',
      message: ''
    };
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  async sendNotification(): Promise<void> {
    if (!this.notificationForm.title.trim() || !this.notificationForm.message.trim()) {
      const toast = await this.toastController.create({
        message: 'Please fill in title and message',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.isSaving.set(true);

    this.notificationService.create({
      userId: this.notificationForm.userId || undefined,
      message: this.notificationForm.message,
      type: this.notificationForm.type
    }).subscribe({
      next: async (response: ApiResponse<Notification>) => {
        this.isSaving.set(false);
        if (response.success) {
          this.closeModal();
          this.loadNotifications();
          const toast = await this.toastController.create({
            message: 'Notification sent successfully',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
        }
      },
      error: async () => {
        this.isSaving.set(false);
        const toast = await this.toastController.create({
          message: 'Failed to send notification',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}
