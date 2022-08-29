import { Injectable } from '@angular/core';
import { combineLatest, map, Observable, of } from 'rxjs';
import { prodMock } from './products';
import { BehaviorSubject } from 'rxjs';
import { AllProducts, appendUiSubCategory, findParentProductCategory, isAllProducts, mapProduct, mapProductCategory, Product, ProductCategory, removeUiCategory, removeUiSubCategory, UiCategory, UiSubCategory } from './prod-model';

@Injectable({ providedIn: 'root' })
export class ProdMpService {

  private selectedCategories: UiCategory[] = [];
  private selectedSubCategories: UiSubCategory[] = [];

  private selectedCategoriesStream = new BehaviorSubject<UiCategory[]>(
    this.selectedCategories
  );
  private selectedSubCategoriesStream = new BehaviorSubject<UiSubCategory[]>(
    this.selectedSubCategories
  );
  private productsSteam = new BehaviorSubject<Product[]>([]);
  private sortByStream = new BehaviorSubject<[string, boolean]>(["", true]);
  private searchStream = new BehaviorSubject<string>("");
  private CATEGORY_ALL_PRODUCTS = JSON.parse(JSON.stringify(AllProducts));




  constructor() {
    this.getViewProducts().subscribe((products) => {
      this.productsSteam.next(products);
    });
  }

  getAllProducts(): Observable<Product[]> {
    return this._getAllProducts().pipe(
      map((products) => products.map(mapProduct))
    );
  }
  getAllCategories(): Observable<ProductCategory[]> {
    return this.listCategories().pipe(
      map((categories) => {
        const productCategories = categories.map(mapProductCategory);
        productCategories
          .filter(prdCat => prdCat.isSubCategory)
          .forEach(subCat => {
            const found = findParentProductCategory(productCategories, subCat.parent);
            if (found) {
              found.children = found.children || [];
              found.children.push(subCat);
            }
          });

        console.log('ProductCategories:', productCategories);
        return productCategories;
      })
    );
  }

  clearAllFilters() {
    this.selectedCategories.forEach((selCat) => {
      selCat.selected = false;
      selCat.uiSubCategories.forEach((selSubCat) => {
        selSubCat.selected = false;
      });
    });
  
    this.selectedCategories.length = 0;
    this.selectedSubCategories.length = 0;
    this.triggerSelecteCategoriesStream();
    this.triggerSelecteSubCategoriesStream();
    this.checkAllProductsCategory();
  }

  private _getAllProducts(): Observable<any[]> {
    // return of(pro);
    return of(prodMock.products);
  }

  get CategoryOfAllProducts() {
    return this.CATEGORY_ALL_PRODUCTS;
  }

  getProducts(): Observable<Product[]> {
    return this.productsSteam.asObservable();
  }

  getSelectedCategories(): Observable<UiCategory[]> {
    return this.selectedCategoriesStream.asObservable();
  }

  getSelectedSubCategories(): Observable<UiSubCategory[]> {
    return this.selectedSubCategoriesStream.asObservable();
  }

  getSearchText(): Observable<string> {
    return this.searchStream.asObservable();
  }

  getSortBy(): Observable<[string, boolean]> {
    return this.sortByStream.asObservable();
  }
  updateSearchText(text: string) {
    this.searchStream.next(text);
  }

  updateCategory(uiCategory: UiCategory) {
    this.updateSelectedCategories(uiCategory);
  }

  updateSubCategory(uiSubCategory: UiSubCategory) {
    this.updateSelectedSubCategories(uiSubCategory);
  }

  updateSortBy(sortBy: [string, boolean]) {
    this.sortByStream.next(sortBy);
  }

  private triggerSelecteCategoriesStream() {
    this.selectedCategoriesStream.next(this.selectedCategories);
  }

  private triggerSelecteSubCategoriesStream() {
    this.selectedSubCategoriesStream.next(this.selectedSubCategories);
  }

  private updateSelectedCategories(uiCategory: UiCategory) {
    if (isAllProducts(uiCategory)) {
      if (uiCategory.selected) {
        this.selectedCategories.length = 0;
        this.selectedCategories.push(uiCategory);
        this.selectedSubCategories.length = 0;

        this.triggerSelecteCategoriesStream();
        this.triggerSelecteSubCategoriesStream();
      } else {
      }
    } else {
      if (uiCategory.selected) {
        this.selectedCategories.push(uiCategory);
      } else {
        removeUiCategory(this.selectedCategories, uiCategory);
        uiCategory.uiSubCategories.forEach((uiSubCat) => {
          uiSubCat.selected = false;
          removeUiSubCategory(this.selectedSubCategories, uiSubCat);
        });

        this.triggerSelecteSubCategoriesStream();
      }

      this.triggerSelecteCategoriesStream();
    }

    if (this.selectedCategories.length === 0) {
      this.checkAllProductsCategory();
    }
  }

  checkAllProductsCategory() {
    this.CATEGORY_ALL_PRODUCTS.selected = true;
  }

  uncheckAllProductsCategory() {
    this.CATEGORY_ALL_PRODUCTS.selected = false;
  }

  private updateSelectedSubCategories(uiSubCategory: UiSubCategory) {
    if (uiSubCategory.selected) {
      const ifExist = this.selectedSubCategories.find(
        (selSubCat) => selSubCat.subCategory === uiSubCategory.subCategory
      );
      if (!ifExist) {
        this.selectedSubCategories.push(uiSubCategory);
      }
    } else {
      this.selectedCategories.forEach((selCat) => {
        selCat.uiSubCategories.forEach((selSubCat) => {
          if (selSubCat.subCategory === uiSubCategory.subCategory) {
            selSubCat.selected = false;
          }
        });
      });
      removeUiSubCategory(this.selectedSubCategories, uiSubCategory);
    }

    this.triggerSelecteSubCategoriesStream();
  }

  listCategories(): Observable<any[]>{
    return of(prodMock).pipe(
      map(({ categories }) => {
        return categories;
      })
    );
  }

  listProducts(): Observable<any[]> {
    return of(prodMock).pipe(map(({ products }) => products));
  }

  getViewProducts(): Observable<Product[]> {
    const getSelectedCategories = this.getSelectedCategories();
    const getSelectedSubCategories = this.getSelectedSubCategories();
    const getAllProducts = this.getAllProducts();
    const searchText = this.getSearchText();
    const sortBySource = this.getSortBy();

    const getOptions = combineLatest([
      getSelectedCategories,
      getSelectedSubCategories,
      searchText,
      sortBySource,
    ]);

    return combineLatest([getAllProducts, getOptions]).pipe(
      map(
        ([
          products,
          [
            selectedCategories,
            selectedSubCategories,
            search,
            [sortBy, sortAsc],
          ],
        ]) => {
          console.log(
            'core =>',
            products,
            selectedCategories,
            selectedSubCategories,
            search,
            sortBy,
            sortAsc
          );

          // filter
          let filterProducts: Product[] = products;
          if (selectedSubCategories.length > 0) {
            const productsOfSubCat = filterBySubCategories(
              products,
              selectedSubCategories
            );
            const restCategories = selectedCategories.filter((selCat) => {
              return !selectedSubCategories.find(
                (selSubCat) => selSubCat.uiCategory.category === selCat.category
              );
            });

            const restProducts = filterByCategories(products, restCategories);
            productsOfSubCat.push.apply(productsOfSubCat, restProducts);

            filterProducts = productsOfSubCat;
          } else if (selectedCategories.length > 0) {
            filterProducts = filterByCategories(products, selectedCategories);
          }

          // search
          let searchProducts: Product[] = filterProducts;
          if (search) {
            searchProducts = filterProducts.filter((prd) => {
              const result = prd.name
                .toLocaleLowerCase()
                .includes(search.toLocaleLowerCase());

              const skuResult = prd.$product.definition.skus.find(
                (sku: { alias: string }) => {
                  if (sku.alias) {
                    return sku.alias
                      .toLocaleLowerCase()
                      .includes(search.toLocaleLowerCase());
                  }
                }
              );

              const addOnResult = prd.$product.definition.addOns.find(
                (addOn: { alias: string }) => {
                  if (addOn.alias) {
                    return addOn.alias
                      .toLocaleLowerCase()
                      .includes(search.toLocaleLowerCase());
                  }
                }
              );

              return result || skuResult || addOnResult;
            });
          }

          // sort
          switch (sortBy) {
            case 'CreatedDate': {
              searchProducts.sort(sortByCreatedDate(sortAsc));
              break;
            }
            case 'ProductName': {
              searchProducts.sort(sortByProductName(sortAsc));
              break;
            }
            case 'UpdatedDate': {
              searchProducts.sort(sortByUpdatedDate(sortAsc));
              break;
            }
          }

          return searchProducts;
        }
      )
    );
  }
  

  
}


function filterBySubCategories( products: Product[], uiSubCategories: UiSubCategory[]): Product[] {
  return products.filter((prd) => {
    const found = uiSubCategories.find((selectedSubCat) => {
      return checkCategory(prd, selectedSubCat.uiCategory) && prd.categories.includes(selectedSubCat.subCategory);
    });

    return !!found;
  });
}

function sortByProductName(asc: boolean) {
  return (prd1: Product, prd2: Product): number =>
    (asc ? 1 : -1) * prd1.name.localeCompare(prd2.name);
}

function sortByCreatedDate(asc: boolean) {
  return (prd1: Product, prd2: Product): number =>
    (asc ? 1 : -1) * (prd1.createdDate.getTime() - prd2.createdDate.getTime());
}

function sortByUpdatedDate(asc: boolean) {
  return (prd1: Product, prd2: Product): number =>
    (asc ? 1 : -1) * (prd1.updatedDate.getTime() - prd2.updatedDate.getTime());
}

function checkCategory(product: Product, uiCategory: UiCategory): boolean {
  const isValidCategories =
    product.categories && Array.isArray(product.categories);
  return (
    isValidCategories &&
    (product.categories.includes(uiCategory.category.name) ||
      product.categories.includes(uiCategory.category.displayName))
  );
}

function filterByCategory(
  products: Product[],
  uiCategory: UiCategory
): Product[] {
  return products.filter((prd) => {
    const found = checkCategory(prd, uiCategory);
    if (found) {
      appendUiSubCategory(uiCategory, prd.company);
    }

    return found;
  });
}

function filterByCategories(
  products: Product[],
  uiCategories: UiCategory[]
): Product[] {
  const filterProducts: Product[] = [];
  uiCategories.forEach((uiCat) => {
    const filterPrds = filterByCategory(products, uiCat);
    if (filterPrds.length) {
      filterPrds.forEach((filterPrd) => {
        if (filterProducts.indexOf(filterPrd) === -1) {
          filterProducts.push(filterPrd);
        }
      });
    }
  });

  return filterProducts;
}


