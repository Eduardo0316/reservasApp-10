import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ReservasListComponent } from './reservas-list/reservas-list.component';
import { ReservaFormDialogComponent } from './reserva-form-dialog/reserva-form-dialog.component';

const routes: Routes = [{ path: '', component: ReservasListComponent }];

@NgModule({
  declarations: [ReservasListComponent, ReservaFormDialogComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class ReservasModule {}
