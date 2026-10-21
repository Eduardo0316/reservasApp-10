import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { HuespedesListComponent } from './huespedes-list/huespedes-list.component';
import { HuespedFormDialogComponent } from './huesped-form-dialog/huesped-form-dialog.component';

const routes: Routes = [{ path: '', component: HuespedesListComponent }];

@NgModule({
  declarations: [HuespedesListComponent, HuespedFormDialogComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class HuespedesModule {}
