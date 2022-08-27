import { Injectable } from '@angular/core';
import { combineLatest, map, Observable, of } from 'rxjs';
import { prodMock } from './products';
import { BehaviorSubject } from 'rxjs';
import { AllProducts, appendUiSubCategory, mapProduct, Product, UiCategory, UiSubCategory } from './prod-model';

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

  private _getAllProducts(): Observable<any[]> {
    // return of(pro);
    return of(prodMock.products);
  }

  getProducts(): Observable<Product[]> {
    return this.productsSteam.asObservable();
  }

  listCategories(): Observable<any[]> {
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
  
  getSortBy(): Observable<[string, boolean]> {
    return this.sortByStream.asObservable();
  }

  getSearchText(): Observable<string> {
    return this.searchStream.asObservable();
  }

  getSelectedCategories(): Observable<UiCategory[]> {
    return this.selectedCategoriesStream.asObservable();
  }

  getSelectedSubCategories(): Observable<UiSubCategory[]> {
    return this.selectedSubCategoriesStream.asObservable();
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
