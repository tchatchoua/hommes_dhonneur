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
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  addOutline, 
  mailOutline,
  closeOutline,
  copyOutline,
  trashOutline,
  checkmarkCircleOutline,
  timeOutline
} from 'ionicons/icons';
import { InvitationService } from '@core/services/invitation.service';
import { ApiResponse } from '@core/models/auth.models';
import { Invitation } from '@core/models/models';

@Component({
  selector: 'app-admin-invitations',
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
    IonInput
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Invitations</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      @if (isLoading() && invitations().length === 0) {
        <div class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading invitations...</p>
        </div>
      } @else if (invitations().length === 0) {
        <div class="empty-state">
          <ion-icon name="mail-outline"></ion-icon>
          <h3>No Invitations</h3>
          <p>Send invitations to grow your community</p>
          <ion-button (click)="openAddModal()">
            <ion-icon slot="start" name="add-outline"></ion-icon>
            Send Invitation
          </ion-button>
        </div>
      } @else {
        <ion-list>
          @for (invitation of invitations(); track invitation.id) {
            <ion-item>
              <ion-icon 
                [name]="invitation.isUsed ? 'checkmark-circle-outline' : 'time-outline'" 
                slot="start" 
                [color]="invitation.isUsed ? 'success' : 'warning'"
              ></ion-icon>
              <ion-label>
                <h2>Invitation #{{ invitation.id }}</h2>
                <p>Expires: {{ invitation.expirationDate | date:'medium' }}</p>
              </ion-label>
              <ion-badge slot="end" [color]="invitation.isUsed ? 'success' : getExpirationColor(invitation)">
                {{ getInvitationStatus(invitation) }}
              </ion-badge>
              @if (!invitation.isUsed && !isExpired(invitation)) {
                <ion-button fill="clear" slot="end" (click)="copyLink(invitation)">
                  <ion-icon slot="icon-only" name="copy-outline"></ion-icon>
                </ion-button>
              }
              <ion-button fill="clear" slot="end" color="danger" (click)="confirmDelete(invitation)">
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
              <ion-title>Create Invitation</ion-title>
              <ion-buttons slot="end">
                <ion-button [disabled]="isSaving()" (click)="createInvitation()">
                  @if (isSaving()) {
                    <ion-spinner name="crescent"></ion-spinner>
                  } @else {
                    Create
                  }
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <div class="modal-content">
              <ion-icon name="mail-outline" class="modal-icon"></ion-icon>
              <h3>Generate Invitation Link</h3>
              <p>A new invitation link will be generated that can be shared with someone to join the community.</p>
            </div>
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

    .modal-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 24px;

      .modal-icon {
        font-size: 64px;
        color: var(--ion-color-primary);
        margin-bottom: 16px;
      }

      h3 {
        margin: 0 0 12px;
        font-size: 20px;
      }

      p {
        color: var(--ion-color-medium);
        margin: 0;
      }
    }
  `]
})
export class AdminInvitationsPage implements OnInit {
  invitations = signal<Invitation[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  isModalOpen = signal(false);

  constructor(
    private invitationService: InvitationService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ 
      addOutline, 
      mailOutline,
      closeOutline,
      copyOutline,
      trashOutline,
      checkmarkCircleOutline,
      timeOutline
    });
  }

  ngOnInit(): void {
    this.loadInvitations();
  }

  loadInvitations(): void {
    this.isLoading.set(true);
    this.invitationService.getAll().subscribe({
      next: (response: ApiResponse<Invitation[]>) => {
        if (response.success && response.data) {
          this.invitations.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  refresh(event: any): void {
    this.loadInvitations();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  isExpired(invitation: Invitation): boolean {
    return new Date(invitation.expirationDate) < new Date();
  }

  getInvitationStatus(invitation: Invitation): string {
    if (invitation.isUsed) return 'Used';
    if (this.isExpired(invitation)) return 'Expired';
    return 'Pending';
  }

  getExpirationColor(invitation: Invitation): string {
    if (this.isExpired(invitation)) return 'danger';
    return 'warning';
  }

  openAddModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  async createInvitation(): Promise<void> {
    this.isSaving.set(true);

    this.invitationService.create().subscribe({
      next: async (response: ApiResponse<Invitation>) => {
        this.isSaving.set(false);
        if (response.success && response.data) {
          this.closeModal();
          this.loadInvitations();
          // Copy the link to clipboard
          const link = `${window.location.origin}/auth/register?token=${response.data.token}`;
          await navigator.clipboard.writeText(link);
          const toast = await this.toastController.create({
            message: 'Invitation created! Link copied to clipboard.',
            duration: 3000,
            color: 'success'
          });
          await toast.present();
        }
      },
      error: async (error) => {
        this.isSaving.set(false);
        console.error('Failed to create invitation:', error);
        const toast = await this.toastController.create({
          message: 'Failed to create invitation',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  async copyLink(invitation: Invitation): Promise<void> {
    const link = `${window.location.origin}/auth/register?token=${invitation.token}`;
    await navigator.clipboard.writeText(link);
    const toast = await this.toastController.create({
      message: 'Invitation link copied to clipboard',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  }

  async confirmDelete(invitation: Invitation): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete Invitation',
      message: `Are you sure you want to delete this invitation?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteInvitation(invitation);
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteInvitation(invitation: Invitation): Promise<void> {
    this.invitationService.delete(invitation.id).subscribe({
      next: async (response: ApiResponse<boolean>) => {
        if (response.success) {
          this.loadInvitations();
          const toast = await this.toastController.create({
            message: 'Invitation deleted',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
        }
      },
      error: async () => {
        const toast = await this.toastController.create({
          message: 'Failed to delete invitation',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}
