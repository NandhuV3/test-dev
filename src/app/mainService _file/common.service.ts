import { Injectable, OnDestroy, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CommonService implements OnInit, OnDestroy {
  indexDB_Name: string = null;

  constructor() {}

  ngOnInit(): void {}

  async createIndexed_DB() {
    const indexedDB = window.indexedDB;
    if (!indexedDB) {
      alert('Indexed db is not supporting on your version');
      // 'IndexedDB could not be found in this browser.';
    }
    // 1
    const request = indexedDB.open(this.indexDB_Name, 1);
    // 2
    request.onerror = function (event) {
      alert('An error occurred with IndexedDB');
      // error(event);
    };
    // 3
    request.onupgradeneeded = function () {
      const db = request.result;
      db.createObjectStore('data', { keyPath: '_id' });
    };
    return 'created';
  }
  clear_indexed_DB() {
    const request = indexedDB.open(this.indexDB_Name, 1);
    request.onsuccess = (e: any) => {
      const db = request.result;
      const transaction = db.transaction('data', 'readwrite');
      const storeObj = transaction.objectStore('data');
      storeObj.clear();
    };
  }
  closeIndexed_DB() {
    const indexedDB = window.indexedDB;
    indexedDB.deleteDatabase(this.indexDB_Name);
    sessionStorage.removeItem('vpocObj');
  }
  vpoc_valueArea(chartData: any) {
    var Array_POC = {};
    var volumePOC = {};
    var valueArea = {};
    chartData.forEach((d) => {
      var last_price = Number(2 * Math.round(d.latestTradedPrice / 2));

      if (Object.keys(Array_POC).indexOf(last_price.toString()) != -1) {
        Array_POC[last_price] += Number(d.lastTradedQuantity);
      } else {
        Array_POC[last_price] = Number(d.lastTradedQuantity);
      }

      var highVol_price = Object.keys(Array_POC).reduce((a, b) =>
        Array_POC[a] > Array_POC[b] ? a : b
      );
      var total_volume: any = Object.values(Array_POC).reduce(
        (a: any, b: any) => a + b
      );
      volumePOC = {
        price: highVol_price,
        volume: Array_POC[highVol_price],
      };
      var valueAreaVolume = Number(Array_POC[highVol_price]);
      var oneUpPrice = Number(highVol_price);
      var oneDownPrice = Number(highVol_price);
      var vah = Number(highVol_price);
      var val = Number(highVol_price);
      var oneUpVolume = 0;
      var oneDownVolume = 0;
      var f = Object.keys(Array_POC).indexOf(highVol_price.toString());
      var i = 1;
      var j = 1;
      while (valueAreaVolume / total_volume < 0.7) {
        oneUpPrice = Number(Object.keys(Array_POC)[f + i]);
        oneDownPrice = Number(Number(Object.keys(Array_POC)[f - j]));
        oneUpVolume = Array_POC[oneUpPrice];
        oneDownVolume = Array_POC[oneDownPrice];

        if (oneUpVolume == undefined) {
          oneUpVolume = 0;
        }
        if (oneDownVolume == undefined) {
          oneDownVolume = 0;
        }
        if (oneUpVolume > oneDownVolume) {
          i++;
          vah = Number(oneUpPrice);
          oneDownPrice = oneDownPrice + 2;
          valueAreaVolume += Number(oneUpVolume);
        } else {
          j++;
          valueAreaVolume += Number(oneDownVolume);
          val = Number(oneDownPrice);
          oneUpPrice = oneUpPrice + 2;
        }
      }

      valueArea = {
        vah: vah,
        val: val,
        valueAreaVolume: valueAreaVolume,
      };
    });
    let lastEle: any = chartData.slice(-1)[0];
    chartData = null;
    return [{ obj: Array_POC }, lastEle];
  }

  storeData_to_Indexed_DB(data: any) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.indexDB_Name, 1);
      request.onsuccess = (e: any) => {
        const db = request.result;
        const transaction = db.transaction('data', 'readwrite');
        const storeObj = transaction.objectStore('data');
        data.forEach((d: any) => {
          storeObj.put(d);
        });
        resolve(true);
        data = null;
      };
    });
  }
  getDataFrom_Indexed_DB() {

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.indexDB_Name, 1);
      request.onsuccess = async (event: any) => {
        const db = request.result;
        // open a read/write db transaction, ready for retrieving the data
        const transaction = db.transaction(['data'], 'readwrite');
        // create an object store on the transaction
        const objectStore = transaction.objectStore('data');
        // Make a request to get a record by key from the object store
        const objectStoreRequest = objectStore.getAll();
        objectStoreRequest.onsuccess = async (event) => {
          let myRecord: any = objectStoreRequest.result;
          resolve(myRecord);
          myRecord = null;
        };
      };
    });
  }
  ngOnDestroy(): void {}
}
