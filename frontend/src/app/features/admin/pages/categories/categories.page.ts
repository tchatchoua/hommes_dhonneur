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
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ApiResponse } from '../../../../core/models/auth.models';
import { 
  addOutline, 
  folderOutline,
  closeOutline,
  createOutline,
  trashOutline
} from 'ionicons/icons';
import { CategoryService } from '@core/services/category.service';
import { Category } from '@core/models/models';

@Component({
  selector: 'app-admin-categories',
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
    IonSelectOption
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Categories</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      @if (isLoading() && categories().length === 0) {
        <div class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading categories...</p>
        </div>
      } @else if (categories().length === 0) {
        <div class="empty-state">
          <ion-icon name="folder-outline"></ion-icon>
          <h3>No Categories Yet</h3>
          <p>Create your first category</p>
          <ion-button (click)="openAddModal()">
            <ion-icon slot="start" name="add-outline"></ion-icon>
            Add Category
          </ion-button>
        </div>
      } @else {
        <ion-list>
          @for (category of categories(); track category.id) {
            <ion-item>
              <ion-icon name="folder-outline" slot="start" color="primary"></ion-icon>
              <ion-label>
                <h2>{{ category.name }}</h2>
                <p>{{ category.description || 'No description' }}</p>
              </ion-label>
              <ion-button fill="clear" slot="end" (click)="openEditModal(category)">
                <ion-icon slot="icon-only" name="create-outline"></ion-icon>
              </ion-button>
              <ion-button fill="clear" slot="end" color="danger" (click)="confirmDelete(category)">
                <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
              </ion-button>
            </ion-item>
          }
        </ion-list>
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
              <ion-title>{{ editingCategory ? 'Edit' : 'Add' }} Category</ion-title>
              <ion-buttons slot="end">
                <ion-button [disabled]="isSaving()" (click)="saveCategory()">
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
                  [(ngModel)]="categoryForm.name"
                  type="text"
                  label="Category Name"
                  labelPlacement="floating"
                  placeholder="Enter category name"
                ></ion-input>
              </ion-item>
              <ion-item>
                <ion-select
                  [(ngModel)]="categoryForm.type"
                  label="Category Type"
                  labelPlacement="floating"
                  [disabled]="!!editingCategory"
                >
                  <ion-select-option value="Contribution">Contribution</ion-select-option>
                  <ion-select-option value="Debt">Debt</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item>
                <ion-textarea
                  [(ngModel)]="categoryForm.description"
                  label="Description"
                  labelPlacement="floating"
                  placeholder="Enter description (optional)"
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
  `]
})
export class AdminCategoriesPage implements OnInit {
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  isModalOpen = signal(false);
  editingCategory: Category | null = null;

  categoryForm: { name: string; type: 'Contribution' | 'Debt'; description: string } = {
    name: '',
    type: 'Contribution',
    description: ''
  };

  constructor(
    private categoryService: CategoryService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ 
      addOutline, 
      folderOutline,
      closeOutline,
      createOutline,
      trashOutline
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.categoryService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  refresh(event: any): void {
    this.loadCategories();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  openAddModal(): void {
    this.editingCategory = null;
    this.categoryForm = { name: '', type: 'Contribution', description: '' };
    this.isModalOpen.set(true);
  }

  openEditModal(category: Category): void {
    this.editingCategory = category;
    this.categoryForm = {
      name: category.name,
      type: category.type,
      description: category.description || ''
    };
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingCategory = null;
  }

  async saveCategory(): Promise<void> {
    if (!this.categoryForm.name.trim()) {
      const toast = await this.toastController.create({
        message: 'Please enter a category name',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.isSaving.set(true);

    const operation = this.editingCategory
      ? this.categoryService.update(this.editingCategory.id, this.categoryForm)
      : this.categoryService.create(this.categoryForm);

    operation.subscribe({
      next: async (response: ApiResponse<Category>) => {
        this.isSaving.set(false);
        if (response.success) {
          this.closeModal();
          this.loadCategories();
          const toast = await this.toastController.create({
            message: `Category ${this.editingCategory ? 'updated' : 'created'} successfully`,
            duration: 2000,
            color: 'success'
          });
          await toast.present();
        }
      },
      error: async () => {
        this.isSaving.set(false);
        const toast = await this.toastController.create({
          message: `Failed to ${this.editingCategory ? 'update' : 'create'} category`,
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  async confirmDelete(category: Category): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete Category',
      message: `Are you sure you want to delete "${category.name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteCategory(category);
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteCategory(category: Category): Promise<void> {
    this.categoryService.delete(category.id).subscribe({
      next: async (response: ApiResponse<boolean>) => {
        if (response.success) {
          this.loadCategories();
          const toast = await this.toastController.create({
            message: 'Category deleted',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
        }
      },
      error: async () => {
        const toast = await this.toastController.create({
          message: 'Failed to delete category',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}
