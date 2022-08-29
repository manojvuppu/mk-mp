import { Component, Input, OnInit } from '@angular/core';
import { isAllProducts, UiCategory } from '../prod-model';
import { ProdMpService } from '../prod-mp.service';

@Component({
  selector: 'app-prod-categories',
  templateUrl: './prod-categories.component.html',
  styleUrls: ['./prod-categories.component.css']
})
export class ProdCategoriesComponent implements OnInit {

  @Input()
  uiCategories: UiCategory[];

  constructor(private marketplaceService:ProdMpService) { }

  ngOnInit() {
  }

  selectCategory(uiCat: UiCategory) {
    if (uiCat && !uiCat.selected) {
      uiCat.selected = true;

      if (isAllProducts(uiCat)) {
        this.marketplaceService.clearAllFilters();
      } else {
        this.marketplaceService.uncheckAllProductsCategory();
        this.marketplaceService.updateCategory(uiCat);
      }
    }
  }

}