import { Component, OnInit } from '@angular/core';
import { appendUiSubCategory, createUiCategory, Product, UiCategory } from './prod-model';
import { ProdMpService } from './prod-mp.service';

@Component({
  selector: 'app-prod-mp',
  templateUrl: './prod-mp.component.html',
  styleUrls: ['./prod-mp.component.css'],
})
export class ProdMpComponent implements OnInit {

  uiCategories: UiCategory[] = [];
  products: Product[] = [];
  constructor(private prodMpService: ProdMpService) {}

  ngOnInit() {
    console.log('hi');

    this.prodMpService.getProducts()
    .subscribe(products => {
      this.products = products;
      console.log('category - products', this.products);
      // this.createUiCategoryAndFilter();
    });
   
    this.prodMpService.getAllCategories().subscribe((categories) => {
      this.uiCategories = categories.filter((cat) => cat.isParent).map(createUiCategory);
      categories
        .filter((cat) => cat.isSubCategory)
        .forEach((cat) => {
          const found = this.uiCategories.find((uiCat) => uiCat.category.name === cat.parent);
          if (found) {
            appendUiSubCategory(found, cat.name, cat.displayName);
          }
        });

      this.uiCategories.unshift(this.prodMpService.CategoryOfAllProducts);
      console.log('category', this.uiCategories);
     
  
  });
}

}
