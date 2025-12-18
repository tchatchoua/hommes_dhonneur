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
  IonSearchbar,
  IonAvatar,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  ToastController
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  personOutline, 
  searchOutline,
  shieldCheckmarkOutline,
  trashOutline
} from 'ionicons/icons';
import { UserService } from '@core/services/user.service';
import { User } from '@core/models/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
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
    IonSearchbar,
    IonAvatar,
    IonInfiniteScroll,
    IonInfiniteScrollContent
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>User Management</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          [(ngModel)]="searchQuery"
          (ionInput)="onSearch()"
          placeholder="Search users..."
          debounce="300"
        ></ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      @if (isLoading() && users().length === 0) {
        <div class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading users...</p>
        </div>
      } @else if (users().length === 0) {
        <div class="empty-state">
          <ion-icon name="person-outline"></ion-icon>
          <h3>No Users Found</h3>
          <p>No users match your search criteria</p>
        </div>
      } @else {
        <ion-list>
          @for (user of users(); track user.id) {
            <ion-item [routerLink]="['/admin/users', user.id]" detail>
              <ion-avatar slot="start">
                <img [src]="user.photoUrl || 'https://ionicframework.com/docs/img/demos/avatar.svg'" alt="Avatar" />
              </ion-avatar>
              <ion-label>
                <h2>{{ user.firstName }} {{ user.lastName }}</h2>
                <p>{{ user.email }}</p>
                <p>&#64;{{ user.username }}</p>
              </ion-label>
              <ion-badge slot="end" [color]="user.role === 'Admin' ? 'primary' : 'medium'">
                {{ user.role }}
              </ion-badge>
            </ion-item>
          }
        </ion-list>

        <ion-infinite-scroll (ionInfinite)="loadMore($event)">
          <ion-infinite-scroll-content></ion-infinite-scroll-content>
        </ion-infinite-scroll>
      }
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
        margin: 0;
      }
    }

    ion-avatar {
      width: 48px;
      height: 48px;
    }
  `]
})
export class AdminUsersPage implements OnInit {
  users = signal<User[]>([]);
  isLoading = signal(true);
  searchQuery = '';

  currentPage = 1;
  pageSize = 20;
  hasMore = true;

  constructor(
    private userService: UserService,
    private toastController: ToastController
  ) {
    addIcons({ 
      personOutline, 
      searchOutline,
      shieldCheckmarkOutline,
      trashOutline
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(append = false): void {
    if (!append) {
      this.isLoading.set(true);
      this.currentPage = 1;
    }

    this.userService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          let items = response.data;
          // Filter by search query if provided
          if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            items = items.filter(u => 
              u.firstName.toLowerCase().includes(query) ||
              u.lastName.toLowerCase().includes(query) ||
              u.email.toLowerCase().includes(query) ||
              (u.username && u.username.toLowerCase().includes(query))
            );
          }
          if (append) {
            this.users.update(current => [...current, ...items]);
          } else {
            this.users.set(items);
          }
          this.hasMore = false; // No pagination in current API
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onSearch(): void {
    this.loadUsers();
  }

  loadMore(event: any): void {
    // API doesn't support pagination currently
    event.target.complete();
  }

  refresh(event: any): void {
    this.loadUsers();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
