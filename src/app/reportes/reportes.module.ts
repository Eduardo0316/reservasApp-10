import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ReportesComponent } from './reportes.component';
import { ReservasTablaComponent } from './reservas-tabla/reservas-tabla.component';

// El acceso por rol (solo ADMIN) se declara en app-routing con roleGuard.
const routes: Routes = [{ path: '', component: ReportesComponent }];

@NgModule({
  declarations: [ReportesComponent, ReservasTablaComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class ReportesModule {}
