import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
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
  IonSegment,
  IonSegmentButton,
  IonAccordionGroup,
  IonAccordion
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  walletOutline, 
  trendingUpOutline, 
  trendingDownOutline, 
  cashOutline,
  peopleOutline,
  timeOutline,
  arrowForwardOutline,
  personOutline,
  chevronDownOutline,
  listOutline
} from 'ionicons/icons';
import { ContributionService } from '@core/services/contribution.service';
import { DebtService } from '@core/services/debt.service';
import { AuthService } from '@core/services/auth.service';
import { Contribution, Debt } from '@core/models/models';

interface UserFinancialSummary {
  userId: number;
  userName: string;
  totalContributions: number;
  totalDebts: number;
  balance: number;
  pendingDebts: number;
  contributions: Contribution[];
  debts: Debt[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
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
    IonSegment,
    IonSegmentButton,
    IonAccordionGroup,
    IonAccordion
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="welcome-section">
        <h1>Welcome back, {{ currentUser()?.firstName }}!</h1>
        <p>
          @if (isAdmin()) {
            Community financial overview (all members)
          } @else {
            Here's your financial overview
          }
        </p>
      </div>

      @if (isAdmin()) {
        <div class="admin-stats-row">
          <ion-card class="stat-card highlight">
            <ion-card-content>
              <div class="stat-icon members">
                <ion-icon name="people-outline"></ion-icon>
              </div>
              <div class="stat-info">
                <p class="stat-label">Total Members</p>
                <h2 class="stat-value">{{ totalMembers() }}</h2>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      }

      <div class="stats-grid">
        <ion-card class="stat-card">
          <ion-card-content>
            <div class="stat-icon contributions">
              <ion-icon name="trending-up-outline"></ion-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">{{ isAdmin() ? 'Total Community Contributions' : 'Total Contributions' }}</p>
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
              <p class="stat-label">{{ isAdmin() ? 'Total Community Debts' : 'Total Debts' }}</p>
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
              <p class="stat-label">{{ isAdmin() ? 'Community Balance' : 'Net Balance' }}</p>
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
              <p class="stat-label">{{ isAdmin() ? 'All Pending Debts' : 'Pending Debts' }}</p>
              <h2 class="stat-value">{{ pendingDebtsCount() }}</h2>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <div class="section-grid">
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="cash-outline"></ion-icon>
              Recent Contributions
            </ion-card-title>
            <ion-button fill="clear" slot="end" routerLink="/contributions" size="small">
              View All
              <ion-icon slot="end" name="arrow-forward-outline"></ion-icon>
            </ion-button>
          </ion-card-header>
          <ion-card-content>
            @if (isLoadingContributions()) {
              <div class="loading-container">
                <ion-spinner name="crescent"></ion-spinner>
              </div>
            } @else if (recentContributions().length === 0) {
              <p class="empty-message">No contributions yet</p>
            } @else {
              <ion-list>
                @for (contribution of recentContributions(); track contribution.id) {
                  <ion-item>
                    <ion-icon name="cash-outline" slot="start" color="success"></ion-icon>
                    <ion-label>
                      <h3>{{ contribution.amount | currency }}</h3>
                      <p>
                        @if (isAdmin()) {
                          <strong>{{ contribution.userName }}</strong> - 
                        }
                        {{ contribution.description || contribution.categoryName }}
                      </p>
                    </ion-label>
                    <ion-badge slot="end" color="medium">
                      {{ contribution.date | date:'shortDate' }}
                    </ion-badge>
                  </ion-item>
                }
              </ion-list>
            }
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="wallet-outline"></ion-icon>
              Recent Debts
            </ion-card-title>
            <ion-button fill="clear" slot="end" routerLink="/debts" size="small">
              View All
              <ion-icon slot="end" name="arrow-forward-outline"></ion-icon>
            </ion-button>
          </ion-card-header>
          <ion-card-content>
            @if (isLoadingDebts()) {
              <div class="loading-container">
                <ion-spinner name="crescent"></ion-spinner>
              </div>
            } @else if (recentDebts().length === 0) {
              <p class="empty-message">No debts recorded</p>
            } @else {
              <ion-list>
                @for (debt of recentDebts(); track debt.id) {
                  <ion-item>
                    <ion-icon name="wallet-outline" slot="start" color="danger"></ion-icon>
                    <ion-label>
                      <h3>{{ debt.amount | currency }}</h3>
                      <p>
                        @if (isAdmin()) {
                          <strong>{{ debt.userName }}</strong> - 
                        }
                        {{ debt.description || debt.categoryName }}
                      </p>
                    </ion-label>
                    <ion-badge slot="end" [color]="getDebtStatusColor(debt.status)">
                      {{ debt.status }}
                    </ion-badge>
                  </ion-item>
                }
              </ion-list>
            }
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Per-User Financial Summary (Admin Only) -->
      @if (isAdmin()) {
        <ion-card class="user-summary-card">
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="people-outline"></ion-icon>
              Member Financial Summary
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            @if (isLoadingContributions() || isLoadingDebts()) {
              <div class="loading-container">
                <ion-spinner name="crescent"></ion-spinner>
              </div>
            } @else if (userSummaries().length === 0) {
              <p class="empty-message">No member data available</p>
            } @else {
              <div class="summary-table-header">
                <span class="col-name">Member</span>
                <span class="col-contrib">Contributions</span>
                <span class="col-debt">Debts</span>
                <span class="col-balance">Balance</span>
                <span class="col-pending">Pending</span>
              </div>
              <ion-list class="user-summary-list">
                @for (user of userSummaries(); track user.userId) {
                  <ion-item button (click)="viewUserDashboard(user.userId)" class="summary-row clickable">
                    <ion-icon name="person-outline" slot="start" color="primary"></ion-icon>
                    <ion-label class="summary-row-content">
                      <span class="col-name">{{ user.userName }}</span>
                      <span class="col-contrib success-text">{{ user.totalContributions | currency }}</span>
                      <span class="col-debt danger-text">{{ user.totalDebts | currency }}</span>
                      <span class="col-balance" [class.success-text]="user.balance >= 0" [class.danger-text]="user.balance < 0">
                        {{ user.balance | currency }}
                      </span>
                      <ion-badge [color]="user.pendingDebts > 0 ? 'warning' : 'success'" class="col-pending">
                        {{ user.pendingDebts }}
                      </ion-badge>
                    </ion-label>
                    <ion-icon name="arrow-forward-outline" slot="end" color="medium"></ion-icon>
                  </ion-item>
                }
              </ion-list>
            }
          </ion-card-content>
        </ion-card>
      }
    </ion-content>
  `,
  styles: [`
    .welcome-section {
      margin-bottom: 24px;

      h1 {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 4px;
        color: var(--ion-color-dark);
      }

      p {
        color: var(--ion-color-medium);
        margin: 0;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
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

      &.members {
        background: linear-gradient(135deg, var(--ion-color-tertiary), var(--ion-color-tertiary-shade));
      }
    }

    .admin-stats-row {
      margin-bottom: 16px;

      .stat-card.highlight {
        background: linear-gradient(135deg, var(--ion-color-tertiary-tint), var(--ion-color-tertiary));
        
        .stat-label, .stat-value {
          color: white;
        }
        
        .stat-icon {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }

    .stat-info {
      flex: 1;
    }

    .stat-label {
      font-size: 12px;
      color: var(--ion-color-medium);
      margin: 0 0 4px 0;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 700;
      margin: 0;

      &.positive {
        color: var(--ion-color-success);
      }

      &.negative {
        color: var(--ion-color-danger);
      }
    }

    .section-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    ion-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      ion-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
      }
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 24px;
    }

    .empty-message {
      text-align: center;
      color: var(--ion-color-medium);
      padding: 24px;
      margin: 0;
    }

    ion-list {
      padding: 0;
    }

    /* Per-User Summary Styles */
    .user-summary-card {
      margin-top: 24px;
    }

    .summary-table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 80px;
      gap: 8px;
      padding: 12px 16px;
      background: var(--ion-color-light);
      border-radius: 8px;
      margin-bottom: 8px;
      font-weight: 600;
      font-size: 12px;
      color: var(--ion-color-medium-shade);
    }

    .summary-row-content {
      display: grid !important;
      grid-template-columns: 2fr 1fr 1fr 1fr 80px;
      gap: 8px;
      align-items: center;
      width: 100%;
    }

    .col-name {
      font-weight: 500;
    }

    .col-contrib, .col-debt, .col-balance {
      text-align: right;
      font-size: 14px;
    }

    .col-pending {
      text-align: center;
    }

    .success-text {
      color: var(--ion-color-success);
    }

    .danger-text {
      color: var(--ion-color-danger);
    }

    .user-summary-list {
      padding: 0;
    }

    .summary-row.clickable {
      --background: var(--ion-color-light-tint);
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    }

    @media (max-width: 768px) {
      .summary-table-header {
        display: none;
      }

      .summary-row-content {
        display: flex !important;
        flex-direction: column;
        align-items: flex-start !important;
        gap: 4px;
      }

      .col-name {
        font-weight: 600;
        margin-bottom: 4px;
      }

      .col-contrib, .col-debt, .col-balance {
        text-align: left;
        font-size: 12px;
      }

      .col-contrib::before {
        content: 'Contributions: ';
        color: var(--ion-color-medium);
      }

      .col-debt::before {
        content: 'Debts: ';
        color: var(--ion-color-medium);
      }

      .col-balance::before {
        content: 'Balance: ';
        color: var(--ion-color-medium);
      }
    }
  `]
})
export class DashboardPage implements OnInit {
  recentContributions = signal<Contribution[]>([]);
  recentDebts = signal<Debt[]>([]);
  allContributions = signal<Contribution[]>([]);
  allDebts = signal<Debt[]>([]);
  isLoadingContributions = signal(true);
  isLoadingDebts = signal(true);

  totalContributions = signal(0);
  totalDebts = signal(0);
  totalMembers = signal(0);
  netBalance = computed(() => this.totalContributions() - this.totalDebts());
  pendingDebtsCount = computed(() => {
    const debts = this.isAdmin() ? this.allDebts() : this.recentDebts();
    return debts.filter(d => d.status === 'Pending').length;
  });

  // Per-user financial summary for admin
  userSummaries = computed<UserFinancialSummary[]>(() => {
    if (!this.isAdmin()) return [];
    
    const contributions = this.allContributions();
    const debts = this.allDebts();
    
    // Create a map of user summaries
    const userMap = new Map<number, UserFinancialSummary>();
    
    // Process contributions
    contributions.forEach(c => {
      if (!userMap.has(c.userId)) {
        userMap.set(c.userId, {
          userId: c.userId,
          userName: c.userName || 'Unknown',
          totalContributions: 0,
          totalDebts: 0,
          balance: 0,
          pendingDebts: 0,
          contributions: [],
          debts: []
        });
      }
      const user = userMap.get(c.userId)!;
      user.totalContributions += c.amount;
      user.contributions.push(c);
    });
    
    // Process debts
    debts.forEach(d => {
      if (!userMap.has(d.userId)) {
        userMap.set(d.userId, {
          userId: d.userId,
          userName: d.userName || 'Unknown',
          totalContributions: 0,
          totalDebts: 0,
          balance: 0,
          pendingDebts: 0,
          contributions: [],
          debts: []
        });
      }
      const user = userMap.get(d.userId)!;
      user.totalDebts += d.amount;
      if (d.status === 'Pending') {
        user.pendingDebts++;
      }
      user.debts.push(d);
    });
    
    // Calculate balances and sort by name
    const summaries = Array.from(userMap.values());
    summaries.forEach(s => {
      s.balance = s.totalContributions - s.totalDebts;
      // Sort contributions and debts by date descending
      s.contributions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      s.debts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    
    return summaries.sort((a, b) => a.userName.localeCompare(b.userName));
  });

  // Track selected tab per user
  selectedHistoryTab: { [userId: number]: string } = {};

  currentUser = computed(() => this.authService.currentUser());
  isAdmin = computed(() => this.authService.isAdmin());

  constructor(
    private router: Router,
    private authService: AuthService,
    private contributionService: ContributionService,
    private debtService: DebtService
  ) {
    addIcons({ 
      walletOutline, 
      trendingUpOutline, 
      trendingDownOutline, 
      cashOutline,
      peopleOutline,
      timeOutline,
      arrowForwardOutline,
      personOutline,
      chevronDownOutline,
      listOutline
    });
  }

  onTabChange(userId: number, tab: string): void {
    this.selectedHistoryTab[userId] = tab;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadContributions();
    this.loadDebts();
  }

  loadContributions(): void {
    this.isLoadingContributions.set(true);
    
    // Admin gets all contributions, regular user gets their own
    const request$ = this.isAdmin() 
      ? this.contributionService.getAll()
      : this.contributionService.getMyContributions();
    
    request$.subscribe({
      next: (response) => {
        if (response.success && response.data) {
          if (this.isAdmin()) {
            this.allContributions.set(response.data);
            // Count unique users for total members and initialize tabs
            const uniqueUsers = new Set(response.data.map(c => c.userId));
            this.totalMembers.set(uniqueUsers.size);
            // Initialize history tabs for each user
            uniqueUsers.forEach(userId => {
              if (!this.selectedHistoryTab[userId]) {
                this.selectedHistoryTab[userId] = 'contributions';
              }
            });
          }
          this.recentContributions.set(response.data.slice(0, 10));
          this.totalContributions.set(
            response.data.reduce((sum: number, c: Contribution) => sum + c.amount, 0)
          );
        }
        this.isLoadingContributions.set(false);
      },
      error: () => {
        this.isLoadingContributions.set(false);
      }
    });
  }

  loadDebts(): void {
    this.isLoadingDebts.set(true);
    
    // Admin gets all debts, regular user gets their own
    const request$ = this.isAdmin()
      ? this.debtService.getAll()
      : this.debtService.getMyDebts();
    
    request$.subscribe({
      next: (response) => {
        if (response.success && response.data) {
          if (this.isAdmin()) {
            this.allDebts.set(response.data);
            // Update total members count with debt users too and initialize tabs
            const existingUsers = new Set(this.allContributions().map(c => c.userId));
            response.data.forEach(d => {
              existingUsers.add(d.userId);
              if (!this.selectedHistoryTab[d.userId]) {
                this.selectedHistoryTab[d.userId] = 'contributions';
              }
            });
            this.totalMembers.set(existingUsers.size);
          }
          this.recentDebts.set(response.data.slice(0, 10));
          this.totalDebts.set(
            response.data.reduce((sum: number, d: Debt) => sum + d.amount, 0)
          );
        }
        this.isLoadingDebts.set(false);
      },
      error: () => {
        this.isLoadingDebts.set(false);
      }
    });
  }

  refresh(event: any): void {
    this.loadData();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  getDebtStatusColor(status: string): string {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'Overdue': return 'danger';
      default: return 'medium';
    }
  }

  viewUserDashboard(userId: number): void {
    this.router.navigate(['/dashboard/user', userId]);
  }
}
