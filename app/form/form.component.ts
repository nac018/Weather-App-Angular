import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, HostBinding, Input} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ResultsService } from '../services/results.service';
import { MatAutocompleteModule } from '@angular/material';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map,startWith } from 'rxjs/operators';
import { BlockingProxy } from 'blocking-proxy';
import { delay } from 'q';

const material = [MatAutocompleteModule];

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})

export class FormComponent implements OnInit,AfterViewInit {
  
  inputDisabled = false;

  isValid = true;
  click = true;

  options: string[] = [];

  constructor(
    private submitObject : ResultsService
  ) { }

  ngOnInit() {
    this.submitObject.favCityStateSubmitObservable.subscribe(favCityStateObj => {
      this.favSearch(favCityStateObj);
      console.log(favCityStateObj);
    });
  }


  address = {
    "street": "",
    "city": "",
    "state": ""
  };

  @ViewChild('street',{static: false}) street: ElementRef;
  @ViewChild('city',{static: false}) city: ElementRef;
  @ViewChild('state',{static: false}) state: ElementRef;
  @ViewChild('checkbox',{static: false}) checkbox: ElementRef;
  @ViewChild('search',{static: false}) search: ElementRef;
  @ViewChild('streetWarning',{static: false}) streetWarning: ElementRef;
  @ViewChild('cityWarning',{static: false}) cityWarning: ElementRef;
  @ViewChild('form',{static: false}) form: AbstractControl;
  @ViewChild('progress',{static: false}) progress: ElementRef;
  @ViewChild('results',{static: false}) results: ElementRef;
  @ViewChild('favorites',{static: false}) favorites: ElementRef;

  ngAfterViewInit(){
    
  }


  log(x) {console.log(x);}

  clearForm(){
    this.street.nativeElement.value = "";
    this.city.nativeElement.value = "";
    this.state.nativeElement.value = "";
    this.street.nativeElement.disabled = false;
    this.city.nativeElement.disabled = false;
    this.state.nativeElement.disabled = false;
    this.checkbox.nativeElement.checked = false;
    this.search.nativeElement.disabled = true;
    this.isValid = true;
    this.clickResults();
    this.submitObject.submitClear();
  }

  disableField(){
    if(this.checkbox.nativeElement.checked == true){
      this.street.nativeElement.disabled = true;
      this.city.nativeElement.disabled = true;
      this.state.nativeElement.disabled = true;
      this.search.nativeElement.disabled = false;
    }
    else{
      this.street.nativeElement.disabled = false;
      this.city.nativeElement.disabled = false;
      this.state.nativeElement.disabled = false;
      if(this.street.nativeElement.value != "" && this.city.nativeElement.value != "" && this.state.nativeElement.value != ""){
        this.search.nativeElement.disabled = false;
      }
      else{
        this.search.nativeElement.disabled = true;
      }
    }
  }

  weatherSearch(){
    this.clickResults();
    
    var submitObject = this.submitObject;

    var setInvalid = () => {
      this.isValid = false;
      this.click = false;
    }

    var setValid = () => {
      this.isValid = true;
      this.click = true;
    }

    function sendJSON(jsonObj){
      if (JSON.stringify(jsonObj) == JSON.stringify({status:"ZERO_RESULTS"})){
        setInvalid();
        submitObject.submitInvalid();
      }
      else{
        setValid();
        submitObject.submitJSON(jsonObj);
      }
    }

    var appear = () => {
      this.progress.nativeElement.style.display = "flex";
      submitObject.submitBar();
    }

    var disappear = () => {
      this.progress.nativeElement.style.display = "none";
    }

    if(!this.checkbox.nativeElement.checked){
      function sendCity(city){
        submitObject.submitCity(city);
      }

      sendCity(this.address.city);
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                var jsonObj = JSON.parse(xmlhttp.responseText);
                console.log(jsonObj);
                sendJSON(jsonObj);
                if (JSON.stringify(jsonObj) == JSON.stringify({status:"ZERO_RESULTS"})){
                  return;
                }
                appear();
                setTimeout(()=>{disappear()},1000);
                return jsonObj;
            }
            else if (xmlhttp.status == 400) {
                var jsonObj = null;
                return jsonObj;
            }
            else {
                var jsonObj = null;
                return jsonObj;
            }
          }
      };
      var url = "https://weatherapp-csci571.appspot.com/search?street=" + this.address.street + "&city=" + this.address.city + "&state=" + this.address.state;
      xmlhttp.open("GET", url, true);
      xmlhttp.send();


      this.stateSearch();
    }
    else {
      function sendCity(city){
        submitObject.submitCity(city);
      }

      function sendLat(lat,lng){
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
          if(xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
              var jsonObj = JSON.parse(xmlhttp.responseText);
              sendJSON(jsonObj);
              appear();
              setTimeout(()=>{disappear()},1000);
              return jsonObj;
            }
            else if (xmlhttp.status == 400) {
              var jsonObj = null;
              return jsonObj;
            }
            else {
              var jsonObj = null;
              return jsonObj;
            }
          }
        }
        var url = "https://weatherapp-csci571.appspot.com/current?lat=" + lat + "&lng=" + lng;
        xmlhttp.open("GET",url,true);
        xmlhttp.send();
        function sendJSON(jsonObj){
          setValid();
          submitObject.submitJSON(jsonObj);
        }
      }
      var submitObject = this.submitObject;
      function sendState(state){
        var xmlhttp = new XMLHttpRequest();
        
        
        function sendState2(state){
          submitObject.submitState(state);
        }
        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                var jsonObj = JSON.parse(xmlhttp.responseText);
                console.log(jsonObj);
                sendState2(jsonObj);
                return jsonObj;
            }
            else if (xmlhttp.status == 400) {
                alert("Not found");
            }
            else {
                alert("Invalid");
            }
          
          }
        };
        var url = "https://weatherapp-csci571.appspot.com/seal?state=" + state;
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
      }


      var url = "https://ipapi.co/json/";
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
        if(xmlhttp.readyState == 4) {
          if(xmlhttp.status == 200) {
            var jsonObj = JSON.parse(xmlhttp.responseText);
            sendLat(jsonObj.latitude,jsonObj.longitude);
            sendCity(jsonObj.city);
            sendState(jsonObj.region_code);
            sendState3(jsonObj.region_code);
            return jsonObj;
          }
          else if (xmlhttp.status == 400) {
            var jsonObj = null;
            return jsonObj;
          }
          else {
              var jsonObj = null;
              return jsonObj;
          }
        }
      }
      function sendState3(stateName){
        submitObject.submitStateName(stateName);
      }
      xmlhttp.open("GET",url,true);
      xmlhttp.send();
    }

  }
  
  favSearch(favCityStateObj){
    this.isValid = true;
    this.click = true;
    this.clickResults();
    
    var submitObject = this.submitObject;

    function sendJSON(jsonObj){
      submitObject.submitJSON(jsonObj);
    }

    var appear = () => {
      this.progress.nativeElement.style.display = "flex";
      submitObject.submitBar();
    }

    var disappear = () => {
      this.progress.nativeElement.style.display = "none";
    }

    function sendCity(city){
      submitObject.submitCity(city);
    }
    sendCity(favCityStateObj.city);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
          if (xmlhttp.status == 200) {
              var jsonObj = JSON.parse(xmlhttp.responseText);
              console.log(jsonObj);
              sendJSON(jsonObj);
              if (JSON.stringify(jsonObj) == JSON.stringify({status:"ZERO_RESULTS"})){
                return;
              }
              appear();
              setTimeout(()=>{disappear()},1000);
              return jsonObj;
          }
          else if (xmlhttp.status == 400) {
              var jsonObj = null;
              return jsonObj;
          }
          else {
              var jsonObj = null;
              return jsonObj;
          }
        }
    };
    var url = "https://weatherapp-csci571.appspot.com/favsearch?street=&city=" + favCityStateObj.city + "&state=" + favCityStateObj.state;
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
    //state
    var xmlhttp2 = new XMLHttpRequest();
    var submitObject = this.submitObject;
    var stateName = favCityStateObj.state;
    function sendState(jsonObj){
      submitObject.submitState(jsonObj);
      submitObject.submitStateName(stateName);
    }
    xmlhttp2.onreadystatechange = function() {
      if (xmlhttp2.readyState == 4) {
        if (xmlhttp2.status == 200) {
            var jsonObj = JSON.parse(xmlhttp2.responseText);
            console.log(jsonObj);
            sendState(jsonObj);
            return jsonObj;
        }
        else if (xmlhttp2.status == 400) {
            alert("Not found");
        }
        else {
            alert("Invalid");
        }
      
      }
    };
    var url = "https://weatherapp-csci571.appspot.com/seal?state=" + favCityStateObj.state;
    xmlhttp2.open("GET", url, true);
    xmlhttp2.send();
  }

  stateSearch(){
    var xmlhttp = new XMLHttpRequest();
    var submitObject = this.submitObject;
    var stateName = this.address.state;
    function sendState(state){
      submitObject.submitState(state);
      submitObject.submitStateName(stateName);
    }
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
            var jsonObj = JSON.parse(xmlhttp.responseText);
            console.log(jsonObj);
            sendState(jsonObj);
            return jsonObj;
        }
        else if (xmlhttp.status == 400) {
            alert("Not found");
        }
        else {
            alert("Invalid");
        }
      
      }
    };
    var url = "https://weatherapp-csci571.appspot.com/seal?state=" + this.address.state;
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }

  citySearch(){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
            var jsonObj = JSON.parse(xmlhttp.responseText);
            console.log(jsonObj);
            setOptions(jsonObj);
            return jsonObj;
        }
        else if (xmlhttp.status == 400) {
            alert("Not found");
        }
        else {
            alert("Invalid");
        }
      
      }
    };
    var url = "https://weatherapp-csci571.appspot.com/autocomplete?cityInput=" + this.address.city;
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
    var setOptions = (jsonObj) => {
      for (var i = 0; i < jsonObj.predictions.length; i++){
        this.options[i] = jsonObj.predictions[i].structured_formatting.main_text;
      }
      console.log(this.options);
    }
  }

  clickResults(){
    this.results.nativeElement.style.color = "white";
    this.results.nativeElement.style.backgroundColor = "#6e91aa";
    this.favorites.nativeElement.style.color = "grey";
    this.favorites.nativeElement.style.backgroundColor = "white";
    this.submitObject.submitResult();
    if(this.isValid == false){
      this.click = false;
    }
  }

  clickFavorites(){
    this.favorites.nativeElement.style.color = "white";
    this.favorites.nativeElement.style.backgroundColor = "#6e91aa";
    this.results.nativeElement.style.color = "grey";
    this.results.nativeElement.style.backgroundColor = "white";
    this.submitObject.submitFavorite();
    if(this.isValid == false){
      this.click = true;
    }
  }

}
