import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MatDatepickerModule } from '@angular/material/datepicker';

const MATERIAL = [
  MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule,
  MatSelectModule, MatDialogModule, MatSnackBarModule, MatMenuModule, MatTooltipModule,
  MatProgressBarModule, MatTabsModule, MatExpansionModule, MatDatepickerModule 
];

/** Módulo compartido por huéspedes, habitaciones, reservas y reportes. */
@NgModule({
  declarations: [ConfirmDialogComponent],
  imports: [CommonModule, ReactiveFormsModule, ...MATERIAL],
  exports: [CommonModule, ReactiveFormsModule, ...MATERIAL, ConfirmDialogComponent],
})
export class SharedModule {}
