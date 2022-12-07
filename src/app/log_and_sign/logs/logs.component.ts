import { HttpClient } from '@angular/common/http';
import { Component, OnInit,ElementRef } from '@angular/core';
import { environment } from 'src/environments/environment';
const BACKEND_URL = environment.apiUrl +"/api/";
@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {

  constructor(
    private http:HttpClient,
    private elementRef : ElementRef
  ) {
    this.getLogs();
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      'white';
  }
  showLogs:any = [];

  ngOnInit(): void {
  }

  async getLogs(){
    this.showLogs = await this.http.post(BACKEND_URL + "getLogs", {}).toPromise();
  }

}
