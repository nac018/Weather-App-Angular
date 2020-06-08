import { Component,Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeeklyService {

  constructor() { }

  private modalSubmit = new Subject<Object>();

  modalSubmitObservable = this.modalSubmit.asObservable();

  submitModal(modalObj: Object){
    console.log(5555555);
    this.modalSubmit.next(modalObj);
    console.log(modalObj);
  }
}
