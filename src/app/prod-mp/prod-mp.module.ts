import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProdCategoriesComponent } from './prod-categories/prod-categories.component';
import { ProdFilterComponent } from './prod-filter/prod-filter.component';
import { ProdGridComponent } from './prod-grid/prod-grid.component';
import { ProdGridCardComponent } from './prod-grid-card/prod-grid-card.component';
import { ProdMpComponent } from './prod-mp.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    ProdCategoriesComponent,
    ProdFilterComponent,
    ProdGridComponent,
    ProdGridCardComponent,
    ProdMpComponent,
  ],
  exports: [
    ProdCategoriesComponent,
    ProdFilterComponent,
    ProdGridComponent,
    ProdGridCardComponent,
    ProdMpComponent,
  ],
})
export class ProdMpModule {}
