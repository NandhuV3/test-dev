import { Component, ElementRef, Injectable, OnDestroy, OnInit } from '@angular/core';

import { FormControl, FormGroup } from '@angular/forms';
import { ProfileServiceService } from '../profilechart/profile-service.service';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-web-socket',
  templateUrl: './displayValues.component.html',
  styleUrls: ['./displayStyle.component.scss'],
})
export class WebSocketComponent implements OnInit, OnDestroy {
  inputData:any;
  constructor(
    public wsService: ProfileServiceService,
    private elementRef : ElementRef
  ) {
    this.connectWS();
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#0f162e';
  }

  ngOnInit(): void {
  }

  checkoutForm = new FormGroup({
    value: new FormControl(),
    labels: new FormControl(''),
  });

  connectWS() {
    this.wsService.dataForScale();
    // this.wsService.get();
  }

  onSubmit() {
    //1. dynamic static seperate.
    // 2. collect labels to array.
    // 3. check subimtted label is exists.
    // False
    // 4. static data - push
    // 5. chart
    var value1 = this.checkoutForm['value'].value;
    var value2 = this.checkoutForm['value'].labels;


    this.checkoutForm.reset();

    // Dyanmic data,.
    var dynamicValue = this.wsService.data2;
    // Static data.
    var inputValue = this.wsService.data1;

    // inputValue.push({'value':+value1,'labels':value2});

    // Label collectd.
    var label = dynamicValue.map((item, index) => {
      return item['labels'];
    });
    //
    var num = inputValue.map((value, index) => {
      return value['labels'];
    });
    // Combine collected labels.
    var both = [...label, ...num];

    // Check submitted data exists.
    if (both.includes(value2)) {
      alert('Already exists');
      return;
    }

    inputValue.push({ value: +value1, labels: value2 });
    this.wsService.data1 = this.inputData = inputValue;
    this.wsService.dataForScale();
  }

  onDelete(i) {
    this.inputData.splice(i, 1);
    this.wsService.dataForScale();
  }
  ngOnDestroy(): void {
  }
}
