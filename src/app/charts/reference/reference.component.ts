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
    this.changeBTN = false;
    this.emptyContent = false;
    if (this.lablesList.length == 0) {
      this.lablesList.push(value);
      this.postLabels(value);
    } else {
      if (
        this.lablesList.filter((item: any) => item.label == value.label)
          .length == 0
      ) {
        this.lablesList.push(value);
        this.lablesList = this.lablesList.sort((a: any, b: any) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
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
    this.lablesList = await this.$Ref_Service.getLabels();
    if (this.lablesList.length == 0) this.emptyContent = true;
    this.emptyContent = false;
    this.lablesList.sort((a: any, b: any) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  async changeStatus(obj: any) {
    if (obj == null) return;
    await this.$Ref_Service.updateUserLabels({
      label: obj[0],
      AlertStatus: obj[4],
    });
  }

  // post the label
  async postLabels(value: any) {
    if (value == null) return;
    value.timestamp = new Date();
    await this.$Ref_Service.postLabels(value);
  }

  //delete a label
  async deleteLabel(label: string) {
    if (label == null) return;
    this.lablesList = this.lablesList.filter(
      (item: any) => item.label !== label
    );
    await this.$Ref_Service.deleteLabel({ label });
    if (this.lablesList.length == 0) this.emptyContent = true;
    this.emptyContent = false;
  }

  //edit and delete a label
  async editLabel(label: any) {
    if (label == null) return;
    this.label = label[0];
    this.price = label[1];
    this.color = label[2];
    this.date = label[3];
    this.changeBTN = true;
    this.lablesList = this.lablesList.filter(
      (item: any) => item.label !== label[0]
    );
    await this.$Ref_Service.deleteLabel({ label: label[0] });
  }
}
