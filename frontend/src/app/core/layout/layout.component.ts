import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonMenu,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenuToggle,
  IonButtons,
  IonMenuButton,
  IonSplitPane,
  IonRouterOutlet,
  IonAvatar,
  IonChip,
  IonItemDivider
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  homeOutline, 
  personOutline, 
  cashOutline, 
  cardOutline,
  peopleOutline,
  pricetagsOutline,
  mailOutline,
  notificationsOutline,
  logOutOutline,
  settingsOutline
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonMenu,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonMenuToggle,
    IonButtons,
    IonMenuButton,
    IonSplitPane,
    IonRouterOutlet,
    IonAvatar,
    IonChip,
    IonItemDivider
  ],
  template: `
    <ion-split-pane contentId="main-content">
      <ion-menu contentId="main-content" type="overlay">
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Finance Tracker</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <!-- User info -->
          <div class="user-info">
            <ion-avatar>
              <img [src]="authService.currentUser()?.photoUrl || 'assets/avatar-placeholder.png'" alt="avatar" />
            </ion-avatar>
            <h3>{{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}</h3>
            <ion-chip [color]="authService.isAdmin() ? 'warning' : 'primary'" size="small">
              {{ authService.currentUser()?.role }}
            </ion-chip>
          </div>

          <ion-list>
            <!-- User menu items -->
            <ion-menu-toggle auto-hide="false">
              <ion-item routerLink="/dashboard" routerLinkActive="active-item">
                <ion-icon slot="start" name="home-outline"></ion-icon>
                <ion-label>Dashboard</ion-label>
              </ion-item>
            </ion-menu-toggle>

            <ion-menu-toggle auto-hide="false">
              <ion-item routerLink="/contributions" routerLinkActive="active-item">
                <ion-icon slot="start" name="cash-outline"></ion-icon>
                <ion-label>Contributions</ion-label>
              </ion-item>
            </ion-menu-toggle>

            <ion-menu-toggle auto-hide="false">
              <ion-item routerLink="/debts" routerLinkActive="active-item">
                <ion-icon slot="start" name="card-outline"></ion-icon>
                <ion-label>Debts</ion-label>
              </ion-item>
            </ion-menu-toggle>

            <ion-menu-toggle auto-hide="false">
              <ion-item routerLink="/profile" routerLinkActive="active-item">
                <ion-icon slot="start" name="person-outline"></ion-icon>
                <ion-label>Profile</ion-label>
              </ion-item>
            </ion-menu-toggle>

            <!-- Admin menu items -->
            @if (authService.isAdmin()) {
              <ion-item-divider>
                <ion-label>Admin</ion-label>
              </ion-item-divider>

              <ion-menu-toggle auto-hide="false">
                <ion-item routerLink="/admin/users" routerLinkActive="active-item">
                  <ion-icon slot="start" name="people-outline"></ion-icon>
                  <ion-label>Users</ion-label>
                </ion-item>
              </ion-menu-toggle>

              <ion-menu-toggle auto-hide="false">
                <ion-item routerLink="/admin/categories" routerLinkActive="active-item">
                  <ion-icon slot="start" name="pricetags-outline"></ion-icon>
                  <ion-label>Categories</ion-label>
                </ion-item>
              </ion-menu-toggle>

              <ion-menu-toggle auto-hide="false">
                <ion-item routerLink="/admin/invitations" routerLinkActive="active-item">
                  <ion-icon slot="start" name="mail-outline"></ion-icon>
                  <ion-label>Invitations</ion-label>
                </ion-item>
              </ion-menu-toggle>

              <ion-menu-toggle auto-hide="false">
                <ion-item routerLink="/admin/notifications" routerLinkActive="active-item">
                  <ion-icon slot="start" name="notifications-outline"></ion-icon>
                  <ion-label>Notifications</ion-label>
                </ion-item>
              </ion-menu-toggle>
            }

            <!-- Logout -->
            <ion-menu-toggle auto-hide="false">
              <ion-item (click)="logout()" button>
                <ion-icon slot="start" name="log-out-outline"></ion-icon>
                <ion-label>Logout</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
        </ion-content>
      </ion-menu>

      <div class="ion-page" id="main-content">
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-menu-button></ion-menu-button>
            </ion-buttons>
            <ion-title>Community Finance Tracker</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-router-outlet></ion-router-outlet>
        </ion-content>
      </div>
    </ion-split-pane>
  `,
  styles: [`
    .user-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      background: var(--ion-color-light);

      ion-avatar {
        width: 80px;
        height: 80px;
        margin-bottom: 12px;
      }

      h3 {
        margin: 0 0 8px;
        font-size: 18px;
        font-weight: 600;
      }
    }

    .active-item {
      --background: var(--ion-color-primary-tint);
      --color: var(--ion-color-primary);
    }

    ion-item-divider {
      --background: transparent;
      --color: var(--ion-color-medium);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 16px;
    }
  `]
})
export class LayoutComponent {
  constructor(public authService: AuthService) {
    addIcons({
      homeOutline,
      personOutline,
      cashOutline,
      cardOutline,
      peopleOutline,
      pricetagsOutline,
      mailOutline,
      notificationsOutline,
      logOutOutline,
      settingsOutline
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
