import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { ReferenceService } from 'src/app/mainService _file/referenceService';
declare var $: any;

@Component({
  selector: 'app-reference',
  templateUrl: './reference.component.html',
  styleUrls: ['./reference.component.scss'],
})
export class ReferenceComponent implements OnInit {
  constructor(
    private elementRef: ElementRef,
    private $Ref_Service: ReferenceService
  ) {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#0f162e';
  }
  @ViewChild('ref_Form') form: any;
  ngOnInit(): void {
    this.fetchLabels();
    this.colorPalatte();
  }
  lablesList: any = [];
  tableHeaders: any = [
    'Labels',
    'Price',
    'Color',
    'Date',
    'Alert Status',
    'SMS Status',
    'Alter',
  ];
  showErr: boolean = false;
  showErrMsg: string = 'label already exists!';
  label: string;
  Alertstatus: string;
  SMSstatus: string;
  price: number;
  mobileNumber1: number = null;
  mobileNumber2: number = null;
  date: string = `${moment(new Date()).format('YYYY-MM-DD')}`;
  color: string = '';
  emptyContent: boolean = false;
  emptyContentMsg: string = 'Please add labels to show!';
  overAll_labels: any = [];
  current_week_labels: any = [];
  prev_week_labels: any = [];
  daily_labels: any = [];
  monthly_labels: any = [];

  totalColors: any = [];
  //color property
  colorPalatte() {
    this.totalColors = [
      '000000',
      '993300',
      '333300',
      '003300',
      '003366',
      '000066',
      '333399',
      '333333',
      '660000',
      'FF6633',
      '666633',
      '336633',
      '336666',
      '0066FF',
      '666699',
      '666666',
      'CC3333',
      'FF9933',
      '99CC33',
      '669966',
      '66CCCC',
      '3366FF',
      '663366',
      '999999',
      'CC66FF',
      'FFCC33',
      'FFFF66',
      '99FF66',
      '99CCCC',
      '66CCFF',
      '993366',
      'CCCCCC',
      'FF99CC',
      'FFCC99',
      'FFFF99',
      'CCffCC',
      'CCFFff',
      '99CCFF',
      'CC99FF',
      'FFFFFF',
    ];
    var picker = $('#color-picker');
    $('body').click(function () {
      picker.fadeOut();
    });

    $('.call-picker').click(function (event) {
      event.stopPropagation();
      picker.fadeIn();
    });
  }
  // adding # to color code
  someFun(clr: string) {
    this.color = '#' + clr;
  }

  //submit func
  onSubmit(value: any) {
    if (Object.keys(value).length == 0) return;
    value['AlertStatus'] = 'onslider';
    value['SMS_status'] = 'off';
    value['timestamp'] = new Date();
    if (this.current_label_info == null) {
      value['info'] = 'daily';
    } else {
      value['info'] = this.current_label_info;
    }
    this.current_label_info = null;
    this.changeBTN = false;

    if (this.overAll_labels.length == 0) {
      this.overAll_labels.push(value);
      this.postLabels(value);
    } else {
      if (
        this.overAll_labels.filter((item: any) => item.label == value.label)
          .length == 0
      ) {
        this.overAll_labels.push(value);
        this.overAll_labels = this.overAll_labels.sort((a: any, b: any) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        this.repeat_changes();
        this.postLabels(value);
        this.form.resetForm();
      } else {
        this.showErr = true;
        setTimeout(() => {
          this.showErr = false;
        }, 4000);
      }
    }
  }

  changeBTN: boolean = false;

  //get labels from db
  async fetchLabels() {
    this.overAll_labels = await this.$Ref_Service.getLabels();
    if(this.overAll_labels.length > 0){
      this.repeat_changes();
    }
  }
  repeat_changes() {
    this.current_week_labels = [];
    this.prev_week_labels = [];
    this.daily_labels = [];
    this.monthly_labels = [];
    this.overAll_labels.sort((a: any, b: any) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    this.overAll_labels.forEach((labels: any) => {
      if (labels.info == 'monthly') {
        this.monthly_labels.push(labels);
      } else if (labels.info == 'prevWeek') {
        this.prev_week_labels.push(labels);
      } else if (labels.info == 'currentWeek') {
        this.current_week_labels.push(labels);
      } else {
        this.daily_labels.push(labels);
      }
    });
    if (this.daily_labels.length == 0) {
      this.emptyContent = true;
    }else{
      this.emptyContent = false;
    }
  }
  async changeStatus(obj: any) {
    if (Object.keys(obj).length != 0) {
      await this.$Ref_Service.updateUserLabels({
        label: obj.label,
        AlertStatus: obj.AlertStatus,
      });
    }
  }

  // post the label
  async postLabels(value: any) {
    await this.$Ref_Service.postLabels(value);
  }

  //delete a label
  async deleteLabel(obj: any) {
    if (Object.keys(obj).length != 0) {
      this.overAll_labels = this.overAll_labels.filter(
        (item: any) => item.label !== obj.label
      );
      await this.$Ref_Service.deleteLabel({ label: obj.label });
      this.repeat_changes();
    }
  }

  //edit and delete a label
  current_label_info: string = null;
  async editLabel(obj: any) {
    if (Object.keys(obj).length != 0) {
      this.label = obj.label;
      this.price = obj.price;
      this.color = obj.color;
      this.date = obj.date;
      this.current_label_info = obj.info;
      this.changeBTN = true;
      this.overAll_labels = this.overAll_labels.filter(
        (item: any) => item.label !== obj.label
      );
      this.repeat_changes();
      await this.$Ref_Service.deleteLabel({ label: obj.label });
    }
  }
}
