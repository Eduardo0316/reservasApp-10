import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { HabitacionesListComponent } from './habitaciones-list/habitaciones-list.component';
import { HabitacionFormDialogComponent } from './habitacion-form-dialog/habitacion-form-dialog.component';

const routes: Routes = [{ path: '', component: HabitacionesListComponent }];

@NgModule({
  declarations: [HabitacionesListComponent, HabitacionFormDialogComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class HabitacionesModule {}
