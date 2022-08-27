import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { prodMock } from './products';

@Injectable({ providedIn: 'root' })
export class ProdMpService {
  constructor() {}

  getAllProducts(){
    return of(prodMock)
  }
}
