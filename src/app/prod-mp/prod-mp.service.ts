import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { prodMock } from './products';

@Injectable({ providedIn: 'root' })
export class ProdMpService {
  constructor() {}

  getAllProducts(){
    return of(prodMock)
  }


  listCategories(): Observable<any[]> {
    return of(prodMock).pipe(
        map(({categories}) => {
          return categories;
        })
    );
  }


  listProducts(): Observable<any[]> {
    return of(prodMock).pipe(
        map(({products}) => products)
    );
  }
}
