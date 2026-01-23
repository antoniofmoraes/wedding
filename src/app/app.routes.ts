import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'confirmacao/:confirmation_token',
        loadComponent: () => import('./features/confirmation/confirmation.component')
            .then(m => m.ConfirmationComponent)
    }
];
