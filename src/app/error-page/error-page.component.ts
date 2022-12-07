import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent implements OnInit {

  constructor(private appCom: AppComponent) {

    this.appCom.firstNav = false;
  }

  ngOnInit(): void {
  }
  backToPage(){
    window.history.back();
  }

}
