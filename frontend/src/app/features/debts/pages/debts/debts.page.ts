import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonDatetime,
  IonDatetimeButton,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSegment,
  IonSegmentButton,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  addOutline, 
  walletOutline, 
  closeOutline,
  calendarOutline,
  filterOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { DebtService } from '@core/services/debt.service';
import { CategoryService } from '@core/services/category.service';
import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { Debt, User, Category } from '@core/models/models';

@Component({
  selector: 'app-debts',
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
    IonDatetime,
    IonDatetimeButton,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSegment,
    IonSegmentButton
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>My Debts</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment [(ngModel)]="selectedStatus" (ionChange)="onStatusChange()">
          <ion-segment-button value="all">
            <ion-label>All</ion-label>
          </ion-segment-button>
          <ion-segment-button value="Pending">
            <ion-label>Pending</ion-label>
          </ion-segment-button>
          <ion-segment-button value="Paid">
            <ion-label>Paid</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="summary-card">
        <ion-card>
          <ion-card-content>
            <div class="summary-content">
              <div class="summary-item">
                <span class="label">Total Debt</span>
                <span class="value danger">{{ totalDebt() | currency }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Pending</span>
                <span class="value warning">{{ pendingDebt() | currency }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Paid</span>
                <span class="value success">{{ paidDebt() | currency }}</span>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      @if (isLoading() && debts().length === 0) {
        <div class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading debts...</p>
        </div>
      } @else if (filteredDebts().length === 0) {
        <div class="empty-state">
          <ion-icon name="wallet-outline"></ion-icon>
          <h3>No Debts Found</h3>
          <p>
            @if (selectedStatus === 'all') {
              You don't have any debts recorded
            } @else {
              No {{ selectedStatus.toLowerCase() }} debts
            }
          </p>
        </div>
      } @else {
        <ion-list>
          @for (debt of filteredDebts(); track debt.id) {
            <ion-item>
              <ion-icon name="wallet-outline" slot="start" [color]="getStatusColor(debt.status)"></ion-icon>
              <ion-label>
                <h2>{{ debt.amount | currency }}</h2>
                <p>{{ debt.description || 'No description' }}</p>
                <p class="meta">
                  <ion-icon name="calendar-outline"></ion-icon>
                  Due: {{ debt.dueDate | date:'mediumDate' }}
                </p>
              </ion-label>
              <div slot="end" class="action-buttons">
                <ion-badge [color]="getStatusColor(debt.status)">
                  {{ debt.status }}
                </ion-badge>
                @if (debt.status === 'Pending') {
                  <ion-button fill="clear" size="small" (click)="markAsPaid(debt)">
                    <ion-icon slot="icon-only" name="checkmark-circle-outline"></ion-icon>
                  </ion-button>
                }
              </div>
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
              <ion-title>Add Debt</ion-title>
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
              @if (authService.isAdmin()) {
                <ion-item>
                  <ion-select
                    [(ngModel)]="newDebt.userId"
                    label="Member"
                    labelPlacement="floating"
                    placeholder="Select member"
                  >
                    @for (user of users(); track user.id) {
                      <ion-select-option [value]="user.id">
                        {{ user.firstName }} {{ user.lastName }}
                      </ion-select-option>
                    }
                  </ion-select>
                </ion-item>
              }
              <ion-item>
                <ion-input
                  [(ngModel)]="newDebt.amount"
                  type="number"
                  label="Amount"
                  labelPlacement="floating"
                  placeholder="Enter amount"
                ></ion-input>
              </ion-item>
              <ion-item>
                <ion-select
                  [(ngModel)]="newDebt.categoryId"
                  label="Category"
                  labelPlacement="floating"
                  placeholder="Select category"
                >
                  @for (category of categories(); track category.id) {
                    <ion-select-option [value]="category.id">
                      {{ category.name }}
                    </ion-select-option>
                  }
                </ion-select>
              </ion-item>
              <ion-item>
                <ion-label>Due Date</ion-label>
                <ion-datetime-button datetime="debt-due-date"></ion-datetime-button>
              </ion-item>
              <ion-modal [keepContentsMounted]="true">
                <ng-template>
                  <ion-datetime
                    id="debt-due-date"
                    [(ngModel)]="newDebt.dueDate"
                    presentation="date"
                  ></ion-datetime>
                </ng-template>
              </ion-modal>
              <ion-item>
                <ion-textarea
                  [(ngModel)]="newDebt.description"
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
    .summary-card {
      margin-bottom: 16px;

      ion-card {
        margin: 0;
      }
    }

    .summary-content {
      display: flex;
      justify-content: space-around;
    }

    .summary-item {
      text-align: center;

      .label {
        display: block;
        font-size: 12px;
        color: var(--ion-color-medium);
        margin-bottom: 4px;
      }

      .value {
        font-size: 18px;
        font-weight: 700;

        &.danger {
          color: var(--ion-color-danger);
        }

        &.warning {
          color: var(--ion-color-warning);
        }

        &.success {
          color: var(--ion-color-success);
        }
      }
    }

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

    ion-item {
      .meta {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        margin-top: 4px;

        ion-icon {
          font-size: 14px;
        }
      }
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
  `]
})
export class DebtsPage implements OnInit {
  debts = signal<Debt[]>([]);
  filteredDebts = signal<Debt[]>([]);
  users = signal<User[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  isModalOpen = signal(false);
  
  selectedStatus = 'all';
  
  totalDebt = signal(0);
  pendingDebt = signal(0);
  paidDebt = signal(0);

  currentPage = 1;
  pageSize = 20;
  hasMore = true;

  newDebt = {
    userId: 0,
    amount: 0,
    categoryId: 0,
    date: new Date().toISOString(),
    dueDate: new Date().toISOString(),
    description: ''
  };

  constructor(
    private debtService: DebtService,
    private categoryService: CategoryService,
    private userService: UserService,
    public authService: AuthService,
    private toastController: ToastController
  ) {
    addIcons({ 
      addOutline, 
      walletOutline, 
      closeOutline,
      calendarOutline,
      filterOutline,
      checkmarkCircleOutline
    });
  }

  ngOnInit(): void {
    this.loadDebts();
    this.loadCategories();
    if (this.authService.isAdmin()) {
      this.loadUsers();
    }
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories.set(response.data.filter(c => c.type === 'Debt'));
        }
      }
    });
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.users.set(response.data);
        }
      }
    });
  }

  loadDebts(append = false): void {
    if (!append) {
      this.isLoading.set(true);
      this.currentPage = 1;
    }

    this.debtService.getMyDebts().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const items = response.data;
          if (append) {
            this.debts.update(current => [...current, ...items]);
          } else {
            this.debts.set(items);
            this.calculateTotals(items);
          }
          this.hasMore = false; // No pagination in current API
          this.applyFilter();
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  calculateTotals(debts: Debt[]): void {
    const total = debts.reduce((sum, d) => sum + d.amount, 0);
    const pending = debts.filter(d => d.status === 'Pending').reduce((sum, d) => sum + d.amount, 0);
    const paid = debts.filter(d => d.status === 'Paid').reduce((sum, d) => sum + d.amount, 0);
    
    this.totalDebt.set(total);
    this.pendingDebt.set(pending);
    this.paidDebt.set(paid);
  }

  applyFilter(): void {
    if (this.selectedStatus === 'all') {
      this.filteredDebts.set(this.debts());
    } else {
      this.filteredDebts.set(this.debts().filter(d => d.status === this.selectedStatus));
    }
  }

  onStatusChange(): void {
    this.applyFilter();
  }

  loadMore(event: any): void {
    // API doesn't support pagination currently
    event.target.complete();
  }

  refresh(event: any): void {
    this.loadDebts();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'Overdue': return 'danger';
      default: return 'medium';
    }
  }

  openAddModal(): void {
    this.resetNewDebt();
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  resetNewDebt(): void {
    this.newDebt = {
      userId: 0,
      amount: 0,
      categoryId: 0,
      date: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      description: ''
    };
  }

  async saveDebt(): Promise<void> {
    if (!this.newDebt.amount) {
      const toast = await this.toastController.create({
        message: 'Please enter an amount',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    if (!this.newDebt.categoryId) {
      const toast = await this.toastController.create({
        message: 'Please select a category',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    if (this.authService.isAdmin() && !this.newDebt.userId) {
      const toast = await this.toastController.create({
        message: 'Please select a member',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.isSaving.set(true);

    this.debtService.create({
      userId: this.newDebt.userId || this.authService.currentUser()?.id || 0,
      amount: this.newDebt.amount,
      categoryId: this.newDebt.categoryId,
      date: new Date(this.newDebt.date),
      dueDate: new Date(this.newDebt.dueDate),
      description: this.newDebt.description
    }).subscribe({
      next: async (response) => {
        this.isSaving.set(false);
        if (response.success) {
          this.closeModal();
          this.loadDebts();
          const toast = await this.toastController.create({
            message: 'Debt added successfully',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
        }
      },
      error: async () => {
        this.isSaving.set(false);
        const toast = await this.toastController.create({
          message: 'Failed to add debt',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  async markAsPaid(debt: Debt): Promise<void> {
    this.debtService.updateStatus(debt.id, 'Paid').subscribe({
      next: async (response) => {
        if (response.success) {
          this.loadDebts();
          const toast = await this.toastController.create({
            message: 'Debt marked as paid',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
        }
      },
      error: async () => {
        const toast = await this.toastController.create({
          message: 'Failed to update debt status',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}
