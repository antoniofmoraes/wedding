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

  private loadFamilyData() {
    // TODO: API call
    const mockData: GuestInfo[] = [
      { name: 'John Doe', isChild: false, confirmed: false },
      { name: 'Jane Doe', isChild: false, confirmed: false },
      { name: 'Billy Doe', isChild: true, age: 8, confirmed: false }
    ];

    mockData.forEach(guest => {
      const guestGroup = this.fb.group({
        name: [guest.name],
        isChild: [guest.isChild],
        age: [guest.age],
        confirmed: [guest.confirmed]
      });
      this.guests.push(guestGroup);
    });
  }

  onSubmit() {
    if (this.confirmationForm.valid) {
      console.log(this.confirmationForm.value);
      // TODO: POST to api
    }
  }

  isDeadlinePassed(): boolean {
    return new Date() > this.deadlineDate;
  }
}
