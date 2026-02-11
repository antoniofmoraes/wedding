import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header.component';

interface GuestInfo {
  publicId: string;
  name: string;
  isChild: boolean;
  age?: number;
  attending: boolean | null;
}

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styles: [],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent]
})

export class ConfirmationComponent implements OnInit {
  invitePublicId: string = '';
  confirmationForm: FormGroup;
  isFormEnabled: boolean = true;
  deadlineDate = new Date('2026-02-10T23:59:59');
  isLoading = false;
  loadError: string | null = null;
  submitError: string | null = null;
  submitSuccess: boolean = false;
  submitAttempted: boolean = false;

  // Base URL of the API (adjust if needed or move to environment file)
  private readonly apiBase = 'https://www.rsvp.ivanaga.cloud/api';
  private readonly useMockData = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.confirmationForm = this.fb.group({
      guests: this.fb.array([])
    });
  }

  ngOnInit() {
    this.invitePublicId = this.route.snapshot.params['confirmation_token'];
    this.loadFamilyData();
  }

  get guests() {
    return this.confirmationForm.get('guests') as FormArray;
  }

  updateGuestConfirmation(index: number, attending: boolean) {
    if (this.isDeadlinePassed()) return;
    
    const guest = this.guests.at(index);
    guest.patchValue({ attending });
    guest.get('attending')?.markAsTouched();
  }

  private async loadFamilyData(): Promise<void> {
    this.isLoading = true;
    this.loadError = null;
    try {
      if (this.useMockData) {
        const guests: GuestInfo[] = [
          { publicId: 'QuHeP', name: 'João da Silva', isChild: false, attending: true },
          { publicId: 'QuHeq', name: 'Maria da Silva', isChild: false, attending: false },
          { publicId: 'QuHer', name: 'Pedro da Silva', isChild: true, age: 7, attending: true }
        ];
        guests.forEach(guest => {
          const guestGroup = this.fb.group({
            publicId: [guest.publicId],
            name: [guest.name, [Validators.required, Validators.pattern(/\S+\s+\S+/)]],
            isChild: [guest.isChild],
            age: [guest.age, guest.isChild ? [Validators.required, Validators.min(0)] : []],
            attending: [guest.attending ?? null, [Validators.required]]
          });
          this.guests.push(guestGroup);
          const nameControl = guestGroup.get('name');
          if (nameControl?.invalid) {
            nameControl.markAsTouched();
          }
        });
        return;
      }
      // Assumed endpoint pattern. Adjust to match real API once confirmed.
      const url = `${this.apiBase}/invites/${encodeURIComponent(this.invitePublicId)}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Link inválido, verifique se copiou corretamente e tente novamente. Caso o erro persista, fale conosco pelo whatsapp.');
        }
        throw new Error(`Erro ao carregar dados (status ${res.status}). Tente novamente mais tarde, se o erro persistir, fale conosco pelo whatsapp e se possível nos mande o print da tela.`);
      }
      const data = await res.json();
      // Expecting shape: { invite: { guests: [{ name, isChild, age?, confirmed? | attending? }] } }
      const guests: GuestInfo[] = Array.isArray(data?.invite?.guests) ? data.invite.guests : [];
      if (!guests.length) {
        this.loadError = 'Nenhum convidado encontrado para este token.';
      }
      guests.forEach(guest => {
        const guestGroup = this.fb.group({
          publicId: [guest.publicId],
          name: [guest.name, [Validators.required, Validators.pattern(/\S+\s+\S+/)]],
          isChild: [guest.isChild],
          age: [guest.age, guest.isChild ? [Validators.required, Validators.min(0)] : []],
          attending: [guest.attending ?? null, [Validators.required]]
        });
        this.guests.push(guestGroup);
        const nameControl = guestGroup.get('name');
        if (nameControl?.invalid) {
          nameControl.markAsTouched();
        }
      });
    } catch (err: any) {
      console.error(err);
      this.loadError = err?.message || 'Erro inesperado ao carregar.';
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit() {
    this.submitAttempted = true;
    if (this.isDeadlinePassed()) return;
    if (!this.confirmationForm.valid) {
      this.submitError = 'Responda para todos os convidados.';
      this.guests.controls.forEach(control => {
        control.get('attending')?.markAsTouched();
      });
      return;
    }
    this.submitError = null;
    this.submitSuccess = false;
    try {
      const payload = {
        publicId: this.invitePublicId,
        guests: this.guests.value.map((g: any) => {
          const guestPayload = {
            publicId: g.publicId,
            name: g.name,
            attending: g.attending,
            isChild: g.isChild,
          }

          if (g.age !== null && g.age !== undefined) {
            //@ts-ignore 
            guestPayload['age'] = g.age;
          }

          return guestPayload;
        }
      )};
      const url = `${this.apiBase}/invites/rsvp`;
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
