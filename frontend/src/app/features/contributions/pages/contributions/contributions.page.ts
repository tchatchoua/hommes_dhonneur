import { Component, OnInit, signal, ViewChild } from '@angular/core';
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
  ModalController,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  addOutline, 
  cashOutline, 
  closeOutline,
  calendarOutline,
  filterOutline,
  createOutline,
  trashOutline
} from 'ionicons/icons';
import { ContributionService } from '@core/services/contribution.service';
import { CategoryService } from '@core/services/category.service';
import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { Contribution, Category, User } from '@core/models/models';

@Component({
  selector: 'app-contributions',
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
    IonInfiniteScrollContent
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>My Contributions</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="toggleFilter()">
            <ion-icon slot="icon-only" name="filter-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
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
                <span class="label">Total Contributions</span>
                <span class="value">{{ totalContributions() | currency }}</span>
              </div>
              <div class="summary-item">
                <span class="label">This Month</span>
                <span class="value">{{ thisMonthContributions() | currency }}</span>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      @if (isLoading() && contributions().length === 0) {
        <div class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading contributions...</p>
        </div>
      } @else if (contributions().length === 0) {
        <div class="empty-state">
          <ion-icon name="cash-outline"></ion-icon>
          <h3>No Contributions Yet</h3>
          <p>Start contributing to your community fund</p>
          <ion-button (click)="openAddModal()">
            <ion-icon slot="start" name="add-outline"></ion-icon>
            Add Contribution
          </ion-button>
        </div>
      } @else {
        <ion-list>
          @for (contribution of contributions(); track contribution.id) {
            <ion-item>
              <ion-icon name="cash-outline" slot="start" color="success"></ion-icon>
              <ion-label>
                <h2>{{ contribution.amount | currency }}</h2>
                <p>{{ contribution.description || 'No description' }}</p>
                <p class="meta">
                  <ion-icon name="calendar-outline"></ion-icon>
                  {{ contribution.date | date:'mediumDate' }}
                  @if (authService.isAdmin() && contribution.userName) {
                    <span class="user-name">• {{ contribution.userName }}</span>
                  }
                </p>
              </ion-label>
              <div slot="end" class="item-end">
                @if (contribution.categoryName) {
                  <ion-badge color="primary">
                    {{ contribution.categoryName }}
                  </ion-badge>
                }
                @if (authService.isAdmin()) {
                  <div class="admin-actions">
                    <ion-button fill="clear" size="small" (click)="openEditModal(contribution)">
                      <ion-icon slot="icon-only" name="create-outline" color="primary"></ion-icon>
                    </ion-button>
                    <ion-button fill="clear" size="small" (click)="confirmDelete(contribution)">
                      <ion-icon slot="icon-only" name="trash-outline" color="danger"></ion-icon>
                    </ion-button>
                  </div>
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
              <ion-title>{{ isEditMode() ? 'Edit' : 'Add' }} Contribution</ion-title>
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
              @if (authService.isAdmin()) {
                <ion-item>
                  <ion-select
                    [(ngModel)]="newContribution.userId"
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
                  [(ngModel)]="newContribution.amount"
                  type="number"
                  label="Amount"
                  labelPlacement="floating"
                  placeholder="Enter amount"
                ></ion-input>
              </ion-item>
              <ion-item>
                <ion-select
                  [(ngModel)]="newContribution.categoryId"
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
                <ion-label>Date</ion-label>
                <ion-datetime-button datetime="contribution-date"></ion-datetime-button>
              </ion-item>
              <ion-modal [keepContentsMounted]="true">
                <ng-template>
                  <ion-datetime
                    id="contribution-date"
                    [(ngModel)]="newContribution.date"
                    presentation="date"
                  ></ion-datetime>
                </ng-template>
              </ion-modal>
              <ion-item>
                <ion-textarea
                  [(ngModel)]="newContribution.description"
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
        font-size: 24px;
        font-weight: 700;
        color: var(--ion-color-success);
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
        margin: 0 0 24px;
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

        .user-name {
          color: var(--ion-color-primary);
          font-weight: 500;
        }
      }
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
export class ContributionsPage implements OnInit {
  contributions = signal<Contribution[]>([]);
  categories = signal<Category[]>([]);
  users = signal<User[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  isModalOpen = signal(false);
  isEditMode = signal(false);
  editingContributionId = signal<number | null>(null);
  
  totalContributions = signal(0);
  thisMonthContributions = signal(0);

  currentPage = 1;
  pageSize = 20;
  hasMore = true;

  newContribution = {
    userId: 0,
    amount: 0,
    categoryId: 0,
    date: new Date().toISOString(),
    description: ''
  };

  constructor(
    private contributionService: ContributionService,
    private categoryService: CategoryService,
    private userService: UserService,
    public authService: AuthService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({ 
      addOutline, 
      cashOutline, 
      closeOutline,
      calendarOutline,
      filterOutline,
      createOutline,
      trashOutline
    });
  }

  ngOnInit(): void {
    this.loadContributions();
    this.loadCategories();
    if (this.authService.isAdmin()) {
      this.loadUsers();
    }
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

  loadContributions(append = false): void {
    if (!append) {
      this.isLoading.set(true);
      this.currentPage = 1;
    }

    // Admin sees all contributions, regular users see only their own
    const request$ = this.authService.isAdmin() 
      ? this.contributionService.getAll() 
      : this.contributionService.getMyContributions();

    request$.subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const items = response.data;
          if (append) {
            this.contributions.update(current => [...current, ...items]);
          } else {
            this.contributions.set(items);
            this.calculateTotals(items);
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

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories.set(response.data);
        }
      }
    });
  }

  calculateTotals(contributions: Contribution[]): void {
    const total = contributions.reduce((sum, c) => sum + c.amount, 0);
    this.totalContributions.set(total);

    const now = new Date();
    const thisMonth = contributions
      .filter(c => {
        const date = new Date(c.date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, c) => sum + c.amount, 0);
    this.thisMonthContributions.set(thisMonth);
  }

  loadMore(event: any): void {
    // API doesn't support pagination currently
    event.target.complete();
  }

  refresh(event: any): void {
    this.loadContributions();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  toggleFilter(): void {
    // TODO: Implement filter functionality
  }

  openAddModal(): void {
    this.isEditMode.set(false);
    this.editingContributionId.set(null);
    this.resetNewContribution();
    this.isModalOpen.set(true);
  }

  openEditModal(contribution: Contribution): void {
    this.isEditMode.set(true);
    this.editingContributionId.set(contribution.id);
    this.newContribution = {
      userId: contribution.userId,
      amount: contribution.amount,
      categoryId: contribution.categoryId,
      date: new Date(contribution.date).toISOString(),
      description: contribution.description || ''
    };
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.isEditMode.set(false);
    this.editingContributionId.set(null);
  }

  resetNewContribution(): void {
    this.newContribution = {
      userId: 0,
      amount: 0,
      categoryId: 0,
      date: new Date().toISOString(),
      description: ''
    };
  }

  async confirmDelete(contribution: Contribution): Promise<void> {
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
          this.loadContributions();
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
    if (!this.newContribution.amount || !this.newContribution.categoryId) {
      const toast = await this.toastController.create({
        message: 'Please fill in required fields',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    if (this.authService.isAdmin() && !this.newContribution.userId && !this.isEditMode()) {
      const toast = await this.toastController.create({
        message: 'Please select a member',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.isSaving.set(true);

    if (this.isEditMode() && this.editingContributionId()) {
      // Update existing contribution
      this.contributionService.update(this.editingContributionId()!, {
        amount: this.newContribution.amount,
        categoryId: this.newContribution.categoryId,
        date: new Date(this.newContribution.date),
        description: this.newContribution.description
      }).subscribe({
        next: async (response) => {
          this.isSaving.set(false);
          if (response.success) {
            this.closeModal();
            this.loadContributions();
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
    } else {
      // Create new contribution
      this.contributionService.create({
        userId: this.newContribution.userId || this.authService.currentUser()?.id || 0,
        amount: this.newContribution.amount,
        categoryId: this.newContribution.categoryId,
        date: new Date(this.newContribution.date),
        description: this.newContribution.description
      }).subscribe({
        next: async (response) => {
          this.isSaving.set(false);
          if (response.success) {
            this.closeModal();
            this.loadContributions();
            const toast = await this.toastController.create({
              message: 'Contribution added successfully',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
          }
        },
        error: async () => {
          this.isSaving.set(false);
          const toast = await this.toastController.create({
            message: 'Failed to add contribution',
            duration: 2000,
            color: 'danger'
          });
          await toast.present();
        }
      });
    }
  }
}
