import { Component,Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResultsService {

  constructor() { }

  private jsonSubmit = new Subject<Object>();
  private citySubmit = new Subject<String>();
  private stateSubmit = new Subject<String>();
  private invalidSubmit = new Subject<String>();
  private barSubmit = new Subject<String>();
  private clearSubmit = new Subject<String>();
  private favoriteSubmit = new Subject<String>();
  private resultSubmit = new Subject<String>();
  private stateNameSubmit = new Subject<String>();
  private favCityStateSubmit = new Subject<Object>();

  jsonSubmitObservable = this.jsonSubmit.asObservable();
  citySubmitObservable = this.citySubmit.asObservable();
  stateSubmitObservable = this.stateSubmit.asObservable();
  invalidSubmitObservable = this.invalidSubmit.asObservable();
  barSubmitObservable = this.barSubmit.asObservable();
  clearSubmitObservable = this.clearSubmit.asObservable();
  favoriteSubmitObservable = this.favoriteSubmit.asObservable();
  resultSubmitObservable = this.resultSubmit.asObservable();
  stateNameSubmitObservable = this.stateNameSubmit.asObservable();
  favCityStateSubmitObservable = this.favCityStateSubmit.asObservable();

  submitJSON(jsonObj: Object){
    this.jsonSubmit.next(jsonObj);
  }
  submitCity(cityObj: String){
    this.citySubmit.next(cityObj);
  }

  submitState(stateObj: String){
    this.stateSubmit.next(stateObj);
  }

  submitInvalid(){
    this.invalidSubmit.next();
  }

  submitBar(){
    this.barSubmit.next();
  }

  submitClear(){
    this.clearSubmit.next();
  }

  submitFavorite(){
    this.favoriteSubmit.next();
  }

  submitResult(){
    this.resultSubmit.next();
  }

  submitStateName(stateNameObj: String){
    this.stateNameSubmit.next(stateNameObj);
  }

  submitFavCityState(favCityStateObj: Object){
    this.favCityStateSubmit.next(favCityStateObj);
  }
  
}
