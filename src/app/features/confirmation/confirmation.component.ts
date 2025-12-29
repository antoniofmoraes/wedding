import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header.component';

interface GuestInfo {
  name: string;
  isChild: boolean;
  age?: number;
  confirmed: boolean;
}

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styles: [],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent]
})
export class ConfirmationComponent implements OnInit {
  token: string = '';
  confirmationForm: FormGroup;
  isFormEnabled: boolean = true;
  deadlineDate = new Date('2025-10-31');
  isLoading = false;
  loadError: string | null = null;
  submitError: string | null = null;
  submitSuccess: boolean = false;

  // Base URL of the API (adjust if needed or move to environment file)
  private readonly apiBase = 'http://xsco44swgggs4csckkk04g0w.69.62.91.165.sslip.io:3003';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.confirmationForm = this.fb.group({
      guests: this.fb.array([])
    });
  }

  ngOnInit() {
    this.token = this.route.snapshot.params['confirmation_token'];
    this.loadFamilyData();
  }

  get guests() {
    return this.confirmationForm.get('guests') as FormArray;
  }

  updateGuestConfirmation(index: number, confirmed: boolean) {
    if (this.isDeadlinePassed()) return;
    
    const guest = this.guests.at(index);
    guest.patchValue({ confirmed });
  }

  private async loadFamilyData(): Promise<void> {
    this.isLoading = true;
    this.loadError = null;
    try {
      // Assumed endpoint pattern. Adjust to match real API once confirmed.
      const url = `${this.apiBase}/confirmation/${encodeURIComponent(this.token)}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!res.ok) {
        throw new Error(`Erro ao carregar dados (status ${res.status})`);
      }
      const data = await res.json();
      // Expecting shape: { guests: [{ name, isChild, age?, confirmed? }] }
      const guests: GuestInfo[] = Array.isArray(data?.guests) ? data.guests : [];
      if (!guests.length) {
        this.loadError = 'Nenhum convidado encontrado para este token.';
      }
      guests.forEach(guest => {
        const guestGroup = this.fb.group({
          name: [guest.name],
          isChild: [guest.isChild],
          age: [guest.age],
          confirmed: [guest.confirmed ?? false]
        });
        this.guests.push(guestGroup);
      });
    } catch (err: any) {
      console.error(err);
      this.loadError = err?.message || 'Erro inesperado ao carregar.';
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit() {
    if (!this.confirmationForm.valid || this.isDeadlinePassed()) return;
    this.submitError = null;
    this.submitSuccess = false;
    try {
      const payload = {
        token: this.token,
        guests: this.guests.value.map((g: any) => ({
          name: g.name,
          confirmed: g.confirmed,
          isChild: g.isChild,
          age: g.age
        }))
      };
      const url = `${this.apiBase}/confirmation/${encodeURIComponent(this.token)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Falha ao enviar confirmações (status ${res.status}): ${text}`);
      }
      this.submitSuccess = true;
      // Optionally disable form after success
      this.isFormEnabled = false;
    } catch (err: any) {
      console.error(err);
      this.submitError = err?.message || 'Erro inesperado ao enviar.';
    }
  }

  isDeadlinePassed(): boolean {
    return new Date() > this.deadlineDate;
  }
}
