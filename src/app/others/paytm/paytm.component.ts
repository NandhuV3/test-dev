import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl

@Component({
  selector: 'app-paytm',
  templateUrl: './paytm.component.html',
  styleUrls: ['./paytm.component.scss']
})
export class PaytmComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private elementRef : ElementRef,
    private route : Router
  ) {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#f1f7fc';
      if(document.cookie == ''){
        this.route.navigate(['/login'])
      }
   }

  ngOnInit(): void {

  }
  paymentForm = new FormGroup({
    name : new FormControl(null,Validators.required),
    email : new FormControl(null,Validators.required),
    phone : new FormControl(null,Validators.required),
    amount : new FormControl(null,Validators.required),
  })

  async onSubmit(){
    var url:any = await this.http.post(BACKEND_URL + '/paynow', this.paymentForm.value,{responseType: "text"}).toPromise();
    document.write(url)
    // JSON.parse(url);
    // return `${url}`
    // this.paymentForm.reset();
  }
}
