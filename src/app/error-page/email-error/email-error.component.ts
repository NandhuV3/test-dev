import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-email-error',
  templateUrl: './email-error.component.html',
  styleUrls: ['./email-error.component.scss']
})
export class EmailErrorComponent implements OnInit {

  constructor(private appCom: AppComponent) {
    this.appCom.firstNav = false;
   }

  ngOnInit(): void {
  }

}
