import { Component, OnInit } from '@angular/core';
import { ProdMpService } from '../prod-mp.service';

@Component({
  selector: 'app-prod-grid',
  templateUrl: './prod-grid.component.html',
  styleUrls: ['./prod-grid.component.css']
})
export class ProdGridComponent implements OnInit {

  constructor(private prodMpService:ProdMpService) { }

  ngOnInit() {
    console.log(this.prodMpService.getAllProducts())
  }

}