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
  IonSegmentButton,
  IonModal,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonDatetimeButton,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  walletOutline, 
  trendingUpOutline, 
  trendingDownOutline, 
  cashOutline,
  personOutline,
  timeOutline,
  calendarOutline,
  createOutline,
  trashOutline,
  closeOutline
} from 'ionicons/icons';
import { ContributionService } from '@core/services/contribution.service';
import { DebtService } from '@core/services/debt.service';
import { UserService } from '@core/services/user.service';
import { CategoryService } from '@core/services/category.service';
import { Contribution, Debt, User, Category } from '@core/models/models';
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
    IonSegmentButton,
    IonModal,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonDatetimeButton
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
                      <div slot="end" class="item-end">
                        <ion-badge color="success">
                          {{ contribution.categoryName }}
                        </ion-badge>
                        <div class="admin-actions">
                          <ion-button fill="clear" size="small" (click)="openEditContributionModal(contribution)">
                            <ion-icon slot="icon-only" name="create-outline" color="primary"></ion-icon>
                          </ion-button>
                          <ion-button fill="clear" size="small" (click)="confirmDeleteContribution(contribution)">
                            <ion-icon slot="icon-only" name="trash-outline" color="danger"></ion-icon>
                          </ion-button>
                        </div>
                      </div>
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
                      <div slot="end" class="item-end">
                        <ion-badge [color]="getDebtStatusColor(debt.status)">
                          {{ debt.status }}
                        </ion-badge>
                        <div class="admin-actions">
                          <ion-button fill="clear" size="small" (click)="openEditDebtModal(debt)">
                            <ion-icon slot="icon-only" name="create-outline" color="primary"></ion-icon>
                          </ion-button>
                          <ion-button fill="clear" size="small" (click)="confirmDeleteDebt(debt)">
                            <ion-icon slot="icon-only" name="trash-outline" color="danger"></ion-icon>
                          </ion-button>
                        </div>
                      </div>
                    </ion-item>
                  }
                </ion-list>
              }
            }
          </ion-card-content>
        </ion-card>
      }

      <!-- Edit Contribution Modal -->
      <ion-modal [isOpen]="isContributionModalOpen()" (didDismiss)="closeContributionModal()">
        <ng-template>
          <ion-header>
            <ion-toolbar>
              <ion-buttons slot="start">
                <ion-button (click)="closeContributionModal()">
                  <ion-icon slot="icon-only" name="close-outline"></ion-icon>
                </ion-button>
              </ion-buttons>
              <ion-title>Edit Contribution</ion-title>
              <ion-buttons slot="end">
                <ion-button [disabled]="isSaving()" (click)="saveContribution()">
                  @if (isSaving()) {
                    <ion-spinner name="crescent"></ion-spinner>
                  } @else {
                    Save
                  }
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <ion-list>
              <ion-item>
                <ion-input
                  [(ngModel)]="editContribution.amount"
                  type="number"
                  label="Amount"
                  labelPlacement="floating"
                  placeholder="Enter amount"
                ></ion-input>
              </ion-item>
              <ion-item>
                <ion-select
                  [(ngModel)]="editContribution.categoryId"
                  label="Category"
                  labelPlacement="floating"
                  placeholder="Select category"
                >
                  @for (category of contributionCategories(); track category.id) {
                    <ion-select-option [value]="category.id">
                      {{ category.name }}
                    </ion-select-option>
                  }
                </ion-select>
              </ion-item>
              <ion-item>
                <ion-label>Date</ion-label>
                <ion-datetime-button datetime="edit-contribution-date"></ion-datetime-button>
              </ion-item>
              <ion-modal [keepContentsMounted]="true">
                <ng-template>
                  <ion-datetime
                    id="edit-contribution-date"
                    [(ngModel)]="editContribution.date"
                    presentation="date"
                  ></ion-datetime>
                </ng-template>
              </ion-modal>
              <ion-item>
                <ion-textarea
                  [(ngModel)]="editContribution.description"
                  label="Description"
                  labelPlacement="floating"
                  placeholder="Add a description (optional)"
                  [rows]="3"
                ></ion-textarea>
              </ion-item>
            </ion-list>
          </ion-content>
        </ng-template>
      </ion-modal>

      <!-- Edit Debt Modal -->
      <ion-modal [isOpen]="isDebtModalOpen()" (didDismiss)="closeDebtModal()">
        <ng-template>
          <ion-header>
            <ion-toolbar>
              <ion-buttons slot="start">
                <ion-button (click)="closeDebtModal()">
                  <ion-icon slot="icon-only" name="close-outline"></ion-icon>
                </ion-button>
              </ion-buttons>
              <ion-title>Edit Debt</ion-title>
              <ion-buttons slot="end">
                <ion-button [disabled]="isSaving()" (click)="saveDebt()">
                  @if (isSaving()) {
                    <ion-spinner name="crescent"></ion-spinner>
                  } @else {
                    Save
                  }
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <ion-list>
              <ion-item>
                <ion-input
                  [(ngModel)]="editDebt.amount"
                  type="number"
                  label="Amount"
                  labelPlacement="floating"
                  placeholder="Enter amount"
                ></ion-input>
              </ion-item>
              <ion-item>
                <ion-select
                  [(ngModel)]="editDebt.categoryId"
                  label="Category"
                  labelPlacement="floating"
                  placeholder="Select category"
                >
                  @for (category of debtCategories(); track category.id) {
                    <ion-select-option [value]="category.id">
                      {{ category.name }}
                    </ion-select-option>
                  }
                </ion-select>
              </ion-item>
              <ion-item>
                <ion-label>Due Date</ion-label>
                <ion-datetime-button datetime="edit-debt-due-date"></ion-datetime-button>
              </ion-item>
              <ion-modal [keepContentsMounted]="true">
                <ng-template>
                  <ion-datetime
                    id="edit-debt-due-date"
                    [(ngModel)]="editDebt.dueDate"
                    presentation="date"
                  ></ion-datetime>
                </ng-template>
              </ion-modal>
              <ion-item>
                <ion-textarea
                  [(ngModel)]="editDebt.description"
                  label="Description"
                  labelPlacement="floating"
                  placeholder="Add a description (optional)"
                  [rows]="3"
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

    .item-end {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .admin-actions {
      display: flex;
      gap: 0;
    }
  `]
})
export class UserDashboardPage implements OnInit {
  userId = signal<number>(0);
  user = signal<User | null>(null);
  contributions = signal<Contribution[]>([]);
  debts = signal<Debt[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  isContributionModalOpen = signal(false);
  isDebtModalOpen = signal(false);
  contributionCategories = signal<Category[]>([]);
  debtCategories = signal<Category[]>([]);
  selectedTab = 'contributions';
  
  editingContributionId: number | null = null;
  editContribution = {
    amount: 0,
    categoryId: 0,
    date: new Date().toISOString(),
    description: ''
  };

  editingDebtId: number | null = null;
  editDebt = {
    amount: 0,
    categoryId: 0,
    dueDate: new Date().toISOString(),
    description: ''
  };

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
    private debtService: DebtService,
    private categoryService: CategoryService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({ 
      walletOutline, 
      trendingUpOutline, 
      trendingDownOutline, 
      cashOutline,
      personOutline,
      timeOutline,
      calendarOutline,
      createOutline,
      trashOutline,
      closeOutline
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId.set(+id);
      this.loadUserData();
      this.loadCategories();
    } else {
      this.isLoading.set(false);
    }
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.contributionCategories.set(response.data.filter(c => c.type === 'Contribution'));
          this.debtCategories.set(response.data.filter(c => c.type === 'Debt'));
        }
      }
    });
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

  // Contribution edit/delete methods
  openEditContributionModal(contribution: Contribution): void {
    this.editingContributionId = contribution.id;
    this.editContribution = {
      amount: contribution.amount,
      categoryId: contribution.categoryId,
      date: new Date(contribution.date).toISOString(),
      description: contribution.description || ''
    };
    this.isContributionModalOpen.set(true);
  }

  closeContributionModal(): void {
    this.isContributionModalOpen.set(false);
    this.editingContributionId = null;
  }

  async confirmDeleteContribution(contribution: Contribution): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete Contribution',
      message: `Are you sure you want to delete this contribution of ${contribution.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteContribution(contribution.id);
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteContribution(id: number): Promise<void> {
    this.contributionService.delete(id).subscribe({
      next: async (response) => {
        if (response.success) {
          this.loadUserData();
          const toast = await this.toastController.create({
            message: 'Contribution deleted successfully',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
        }
      },
      error: async () => {
        const toast = await this.toastController.create({
          message: 'Failed to delete contribution',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  async saveContribution(): Promise<void> {
    if (!this.editContribution.amount || !this.editContribution.categoryId) {
      const toast = await this.toastController.create({
        message: 'Please fill in required fields',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.isSaving.set(true);

    this.contributionService.update(this.editingContributionId!, {
      amount: this.editContribution.amount,
      categoryId: this.editContribution.categoryId,
      date: new Date(this.editContribution.date),
      description: this.editContribution.description
    }).subscribe({
      next: async (response) => {
        this.isSaving.set(false);
        if (response.success) {
          this.closeContributionModal();
          this.loadUserData();
          const toast = await this.toastController.create({
            message: 'Contribution updated successfully',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
        }
      },
      error: async () => {
        this.isSaving.set(false);
        const toast = await this.toastController.create({
          message: 'Failed to update contribution',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  // Debt edit/delete methods
  openEditDebtModal(debt: Debt): void {
    this.editingDebtId = debt.id;
    this.editDebt = {
      amount: debt.amount,
      categoryId: debt.categoryId,
      dueDate: debt.dueDate ? new Date(debt.dueDate).toISOString() : new Date().toISOString(),
      description: debt.description || ''
    };
    this.isDebtModalOpen.set(true);
  }

  closeDebtModal(): void {
    this.isDebtModalOpen.set(false);
    this.editingDebtId = null;
  }

  async confirmDeleteDebt(debt: Debt): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete Debt',
      message: `Are you sure you want to delete this debt of ${debt.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteDebt(debt.id);
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteDebt(id: number): Promise<void> {
    this.debtService.delete(id).subscribe({
      next: async (response) => {
        if (response.success) {
          this.loadUserData();
          const toast = await this.toastController.create({
            message: 'Debt deleted successfully',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
        }
      },
      error: async () => {
        const toast = await this.toastController.create({
          message: 'Failed to delete debt',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  async saveDebt(): Promise<void> {
    if (!this.editDebt.amount || !this.editDebt.categoryId) {
      const toast = await this.toastController.create({
        message: 'Please fill in required fields',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.isSaving.set(true);

    this.debtService.update(this.editingDebtId!, {
      amount: this.editDebt.amount,
      categoryId: this.editDebt.categoryId,
      dueDate: new Date(this.editDebt.dueDate),
      description: this.editDebt.description
    }).subscribe({
      next: async (response) => {
        this.isSaving.set(false);
        if (response.success) {
          this.closeDebtModal();
          this.loadUserData();
          const toast = await this.toastController.create({
            message: 'Debt updated successfully',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
        }
      },
      error: async () => {
        this.isSaving.set(false);
        const toast = await this.toastController.create({
          message: 'Failed to update debt',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}
