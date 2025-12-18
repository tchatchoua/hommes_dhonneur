import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonSegment,
  IonSegmentButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  walletOutline, 
  trendingUpOutline, 
  trendingDownOutline, 
  cashOutline,
  personOutline,
  timeOutline,
  calendarOutline
} from 'ionicons/icons';
import { ContributionService } from '@core/services/contribution.service';
import { DebtService } from '@core/services/debt.service';
import { UserService } from '@core/services/user.service';
import { Contribution, Debt, User } from '@core/models/models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-dashboard',
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
    IonSegment,
    IonSegmentButton
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ user()?.firstName }}'s Dashboard</ion-title>
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
          <ion-button (click)="goBack()">Go Back</ion-button>
        </div>
      } @else {
        <!-- User Profile Card -->
        <ion-card class="profile-card">
          <ion-card-content>
            <div class="profile-header">
              <ion-avatar>
                <img [src]="user()?.photoUrl || 'https://ionicframework.com/docs/img/demos/avatar.svg'" alt="Avatar" />
              </ion-avatar>
              <h2>{{ user()?.firstName }} {{ user()?.lastName }}</h2>
              <p>{{ user()?.email }}</p>
              <ion-badge [color]="user()?.role === 'Admin' ? 'primary' : 'medium'">
                {{ user()?.role }}
              </ion-badge>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Financial Summary -->
        <div class="stats-grid">
          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-icon contributions">
                <ion-icon name="trending-up-outline"></ion-icon>
              </div>
              <div class="stat-info">
                <p class="stat-label">Total Contributions</p>
                <h2 class="stat-value">{{ totalContributions() | currency }}</h2>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-icon debts">
                <ion-icon name="trending-down-outline"></ion-icon>
              </div>
              <div class="stat-info">
                <p class="stat-label">Total Debts</p>
                <h2 class="stat-value">{{ totalDebts() | currency }}</h2>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-icon balance" [class.positive]="netBalance() >= 0" [class.negative]="netBalance() < 0">
                <ion-icon name="wallet-outline"></ion-icon>
              </div>
              <div class="stat-info">
                <p class="stat-label">Net Balance</p>
                <h2 class="stat-value" [class.positive]="netBalance() >= 0" [class.negative]="netBalance() < 0">
                  {{ netBalance() | currency }}
                </h2>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-icon pending">
                <ion-icon name="time-outline"></ion-icon>
              </div>
              <div class="stat-info">
                <p class="stat-label">Pending Debts</p>
                <h2 class="stat-value">{{ pendingDebtsCount() }}</h2>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- History Section -->
        <ion-card class="history-card">
          <ion-card-header>
            <ion-card-title>Transaction History</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-segment [(ngModel)]="selectedTab" class="history-segment">
              <ion-segment-button value="contributions">
                <ion-label>Contributions ({{ contributions().length }})</ion-label>
              </ion-segment-button>
              <ion-segment-button value="debts">
                <ion-label>Debts ({{ debts().length }})</ion-label>
              </ion-segment-button>
            </ion-segment>

            @if (selectedTab === 'contributions') {
              @if (contributions().length === 0) {
                <div class="empty-message">
                  <ion-icon name="cash-outline"></ion-icon>
                  <p>No contributions recorded</p>
                </div>
              } @else {
                <ion-list class="history-list">
                  @for (contribution of contributions(); track contribution.id) {
                    <ion-item>
                      <ion-icon name="cash-outline" slot="start" color="success"></ion-icon>
                      <ion-label>
                        <h3>{{ contribution.amount | currency }}</h3>
                        <p>{{ contribution.description || contribution.categoryName }}</p>
                        <p class="date-text">
                          <ion-icon name="calendar-outline"></ion-icon>
                          {{ contribution.date | date:'mediumDate' }}
                        </p>
                      </ion-label>
                      <ion-badge slot="end" color="success">
                        {{ contribution.categoryName }}
                      </ion-badge>
                    </ion-item>
                  }
                </ion-list>
              }
            } @else {
              @if (debts().length === 0) {
                <div class="empty-message">
                  <ion-icon name="wallet-outline"></ion-icon>
                  <p>No debts recorded</p>
                </div>
              } @else {
                <ion-list class="history-list">
                  @for (debt of debts(); track debt.id) {
                    <ion-item>
                      <ion-icon name="wallet-outline" slot="start" color="danger"></ion-icon>
                      <ion-label>
                        <h3>{{ debt.amount | currency }}</h3>
                        <p>{{ debt.description || debt.categoryName }}</p>
                        <p class="date-text">
                          <ion-icon name="calendar-outline"></ion-icon>
                          {{ debt.date | date:'mediumDate' }}
                          @if (debt.dueDate) {
                            | Due: {{ debt.dueDate | date:'mediumDate' }}
                          }
                        </p>
                      </ion-label>
                      <ion-badge slot="end" [color]="getDebtStatusColor(debt.status)">
                        {{ debt.status }}
                      </ion-badge>
                    </ion-item>
                  }
                </ion-list>
              }
            }
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
      margin-bottom: 16px;
    }

    .profile-header {
      padding: 16px;

      ion-avatar {
        width: 80px;
        height: 80px;
        margin: 0 auto 16px;
      }

      h2 {
        font-size: 22px;
        font-weight: 700;
        margin: 0 0 4px;
      }

      p {
        color: var(--ion-color-medium);
        margin: 0 0 12px;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }

    .stat-card {
      margin: 0;
      
      ion-card-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
      }
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      ion-icon {
        font-size: 22px;
        color: white;
      }

      &.contributions {
        background: linear-gradient(135deg, var(--ion-color-success), var(--ion-color-success-shade));
      }

      &.debts {
        background: linear-gradient(135deg, var(--ion-color-danger), var(--ion-color-danger-shade));
      }

      &.balance {
        background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-primary-shade));
      }

      &.pending {
        background: linear-gradient(135deg, var(--ion-color-warning), var(--ion-color-warning-shade));
      }
    }

    .stat-info {
      flex: 1;
    }

    .stat-label {
      font-size: 11px;
      color: var(--ion-color-medium);
      margin: 0 0 2px 0;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 700;
      margin: 0;

      &.positive {
        color: var(--ion-color-success);
      }

      &.negative {
        color: var(--ion-color-danger);
      }
    }

    .history-card {
      ion-card-header {
        ion-card-title {
          font-size: 16px;
        }
      }
    }

    .history-segment {
      margin-bottom: 16px;
    }

    .history-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .empty-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px;
      color: var(--ion-color-medium);

      ion-icon {
        font-size: 48px;
        margin-bottom: 8px;
      }
    }

    .date-text {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--ion-color-medium);
      margin-top: 4px;

      ion-icon {
        font-size: 14px;
      }
    }

    ion-item {
      --padding-start: 0;
    }
  `]
})
export class UserDashboardPage implements OnInit {
  userId = signal<number>(0);
  user = signal<User | null>(null);
  contributions = signal<Contribution[]>([]);
  debts = signal<Debt[]>([]);
  isLoading = signal(true);
  selectedTab = 'contributions';

  totalContributions = computed(() => 
    this.contributions().reduce((sum, c) => sum + c.amount, 0)
  );

  totalDebts = computed(() => 
    this.debts().reduce((sum, d) => sum + d.amount, 0)
  );

  netBalance = computed(() => 
    this.totalContributions() - this.totalDebts()
  );

  pendingDebtsCount = computed(() => 
    this.debts().filter(d => d.status === 'Pending').length
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private contributionService: ContributionService,
    private debtService: DebtService
  ) {
    addIcons({ 
      walletOutline, 
      trendingUpOutline, 
      trendingDownOutline, 
      cashOutline,
      personOutline,
      timeOutline,
      calendarOutline
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId.set(+id);
      this.loadUserData();
    } else {
      this.isLoading.set(false);
    }
  }

  loadUserData(): void {
    this.isLoading.set(true);
    
    // Load user info
    this.userService.getById(this.userId()).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.user.set(response.data);
        }
      }
    });

    // Load all contributions and filter by user
    this.contributionService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const userContributions = response.data
            .filter(c => c.userId === this.userId())
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          this.contributions.set(userContributions);
        }
        this.checkLoaded();
      },
      error: () => this.checkLoaded()
    });

    // Load all debts and filter by user
    this.debtService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const userDebts = response.data
            .filter(d => d.userId === this.userId())
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          this.debts.set(userDebts);
        }
        this.checkLoaded();
      },
      error: () => this.checkLoaded()
    });
  }

  private loadCount = 0;
  private checkLoaded(): void {
    this.loadCount++;
    if (this.loadCount >= 2) {
      this.isLoading.set(false);
      this.loadCount = 0;
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  getDebtStatusColor(status: string): string {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'Overdue': return 'danger';
      default: return 'medium';
    }
  }
}
