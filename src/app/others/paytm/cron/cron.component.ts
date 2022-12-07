import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';

const CRON_URL = environment.apiUrl + '/cron/';


@Component({
  selector: 'app-cron',
  templateUrl: './cron.component.html',
  styleUrls: ['./cron.component.scss']
})
export class CronComponent implements OnInit {

  errormsg: boolean = false;
  cronForm = new FormGroup({
    hour: new FormControl(null, [Validators.required,Validators.maxLength(2),Validators.minLength(1),Validators.pattern("^[0-9][0-9]$")]),
    minute: new FormControl(null, [
      Validators.required,Validators.maxLength(2),Validators.minLength(1),Validators.pattern("^[0-9][0-9]$")]
    ),
  });
  constructor(
    private elementRef: ElementRef,
    private http : HttpClient
    ) {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
    '#08102e';
  }

  ngOnInit(): void {
  }

  onSubmit(){

    var hour = this.cronForm.value.hour;
    var minute = this.cronForm.value.minute;
    if(minute >= 0 && minute <=59){
      if(hour >= 0 && hour <= 23){
        var date = new Date();
        date.setHours(hour);
        date.setMinutes(minute);
        var isoDateString = date.toISOString();
        var split = isoDateString.split("T")[1];
        var split1 = split.split(":")[0];
        var split2 = split.split(":")[1];
        var time = this.http.post(CRON_URL + "cronTime",{hour : split1 , minute: split2}).toPromise();
      }else{
        this.errormsg = true;
        setTimeout(()=>{
          this.errormsg = false;
        },4000)
      }
    }else{
      this.errormsg = true;
      setTimeout(()=>{
        this.errormsg = false;
      },4000)
    }
  }

  async stopCron(){
    var stop = await this.http.post(CRON_URL + "stopCron",{}).toPromise();
  }
  async runCron(){
    var stop = await this.http.post(CRON_URL + "runCron",{}).toPromise();
  }
}
