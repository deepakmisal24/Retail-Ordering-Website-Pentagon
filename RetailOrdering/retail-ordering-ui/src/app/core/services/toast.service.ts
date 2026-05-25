import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum ToastType {
  Success = 'success',
  Danger = 'danger',
  Info = 'info'
}

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  show(message: string, type: ToastType = ToastType.Info) {
    const toast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      type
    };

    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, toast]);

    // Auto-dismiss after 3.5 seconds
    setTimeout(() => {
      this.dismiss(toast.id);
    }, 3500);
  }

  showSuccess(message: string) {
    this.show(message, ToastType.Success);
  }

  showDanger(message: string) {
    this.show(message, ToastType.Danger);
  }

  showInfo(message: string) {
    this.show(message, ToastType.Info);
  }

  dismiss(id: string) {
    const current = this.toastsSubject.value;
    this.toastsSubject.next(current.filter(t => t.id !== id));
  }
}
