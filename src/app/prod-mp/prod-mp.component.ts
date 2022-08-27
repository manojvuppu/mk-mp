import { Component, OnInit } from '@angular/core';
import { ProdMpService } from './prod-mp.service';

@Component({
  selector: 'app-prod-mp',
  templateUrl: './prod-mp.component.html',
  styleUrls: ['./prod-mp.component.css'],
})
export class ProdMpComponent implements OnInit {
  constructor(private prodMpService: ProdMpService) {}

  ngOnInit() {
    console.log('hi');
    this.prodMpService.getAllProducts().subscribe(
      (resp)=>{
        console.log(resp);
      }
    )
  }
}
