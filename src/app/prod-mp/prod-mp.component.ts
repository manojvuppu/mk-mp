import { Component, OnInit } from '@angular/core';
import { Product, UiCategory } from './prod-model';
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
   
    this.prodMpService.listCategories()
    .subscribe(categories => {
      this.uiCategories = categories;
      console.log('category - products', this.uiCategories);
      // this.createUiCategoryAndFilter();
    });
  }

}
