import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { FormComponent } from '../form/form.component';
import { ResultsService } from '../services/results.service';
import * as Chart from 'chart.js';
import * as CanvasJS from '../../../node_modules/canvasjs/dist/canvasjs.min';
import * as Canvas from '../../../node_modules/canvasjs/dist/canvasjs';
import { NgbActiveModal,NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ModalContent } from '../modal/modal.component';
import { NgbModalStack } from '@ng-bootstrap/ng-bootstrap/modal/modal-stack';
import { stat } from 'fs';


@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})


export class ResultComponent implements OnInit,AfterViewInit {
  flag = false;
  isValid = false;
  jsonObj;
  cityObj; 
  stateObj;
  jsonObj2;
  chart: Chart;
  temperatureSelected = true; 
  pressureSelected = false;
  humiditySelected = false;
  ozoneSelected = false;
  visibilitySelected = false;
  windSpeedSelected = false;
  favorite = false;
  fav = false;
  norecords = true;

  constructor(
    private submitObject : ResultsService,
    private modalService: NgbModal
  ) { }

  @ViewChild('hourlySelect',{static: false}) select: ElementRef;
  @ViewChild('myTemperatureChart',{static: false}) temperatureChart: ElementRef;
  @ViewChild('myPressureChart',{static: false}) pressureChart: ElementRef;
  @ViewChild('myHumidityChart',{static: false}) humidityChart: ElementRef;
  @ViewChild('myOzoneChart',{static: false}) ozoneChart: ElementRef;
  @ViewChild('myVisibilityChart',{static: false}) visibilityChart: ElementRef;
  @ViewChild('myWindSpeedChart',{static: false}) windSpeedChart: ElementRef;
  @ViewChild('myWeeklyChart',{static: false}) weeklyChart: ElementRef;
  @ViewChild('table',{static: false}) table: ElementRef;

  ngAfterViewInit(){

  }

  modalDetails = {
    city: "",
    date: "",
    temperature: "",
    summary: "",
    icon: "",
    precipitation: "",
    chanceOfRain: "",
    windSpeed: "",
    humidity: "",
    visibility: ""
  };

  currentDetails = {
    city: "",
    timezone: "",
    temperature: "",
    temperatureNotRound: "",
    summary: "",
    humidity: "",
    pressure: "",
    windSpeed: "",
    visibility: "",
    cloudCover: "",
    ozone: ""
  };

  state_url = "";

  twitter_url = "";

  stateName = "";

  favoritedStuff = [];

  ngOnInit() {
    this.submitObject.jsonSubmitObservable.subscribe(jsonObj => {
      this.jsonObj = jsonObj;
      this.setcurrentDetails(jsonObj);
      this.setTwitterUrl();
      console.log(jsonObj);
    });

    this.submitObject.citySubmitObservable.subscribe(cityObj => {
      this.cityObj = cityObj;
      this.setCity(cityObj);
      console.log(cityObj);
    });

    this.submitObject.stateSubmitObservable.subscribe(stateObj => {
      this.stateObj = stateObj;
      this.setState(stateObj);
      console.log(stateObj);
    });

    this.submitObject.invalidSubmitObservable.subscribe(() => {
      this.isValid = false;
    });

    this.submitObject.barSubmitObservable.subscribe(() => {
      this.flag = false;
      this.isValid = false;
      setTimeout(()=>{
        this.flag = true;
        this.isValid = true;
      },1000);
    });

    this.submitObject.clearSubmitObservable.subscribe(() => {
      this.flag = false;
      this.isValid = false;
    });

    this.submitObject.favoriteSubmitObservable.subscribe(() => {
      this.flag = false;
      this.fav = true;
      this.loadTable();
    });

    this.submitObject.resultSubmitObservable.subscribe(() => {
      this.flag = true;
      this.fav = false;
      var str = this.cityObj + this.stateName;
      if(localStorage.getItem(str) != null){
        this.favorite = true;
      }
      else{
        this.favorite = false;
      }
    });

    this.submitObject.stateNameSubmitObservable.subscribe(stateNameObj => {
      this.setStateName(stateNameObj);
      var str = this.cityObj + this.stateName;
      if(localStorage.getItem(str) != null){
        this.favorite = true;
      }
      else{
        this.favorite = false;
      }
      console.log(stateNameObj);
    });
  }

  setStateName(stateNameObj){
    this.stateName = stateNameObj;
  }


  setcurrentDetails(jsonObj){
    this.currentDetails.timezone = jsonObj.timezone;
    this.currentDetails.temperatureNotRound = jsonObj.currently.temperature;
    this.currentDetails.temperature = (Math.round(jsonObj.currently.temperature)).toString();
    this.currentDetails.summary = jsonObj.currently.summary;
    this.currentDetails.humidity = jsonObj.currently.humidity;
    this.currentDetails.pressure = jsonObj.currently.pressure;
    this.currentDetails.windSpeed = jsonObj.currently.windSpeed;
    this.currentDetails.visibility = jsonObj.currently.visibility;
    this.currentDetails.cloudCover = jsonObj.currently.cloudCover;
    this.currentDetails.ozone = jsonObj.currently.ozone;
  }

  setTwitterUrl(){
    this.twitter_url = encodeURIComponent("The current temperature at " + this.currentDetails.city + " is " + this.currentDetails.temperatureNotRound + "° F. The weather conditions are "+
    this.currentDetails.summary + ". \n#CSCI571WeatherSearch");
    console.log(this.twitter_url);
  }
  
  favorited(){
    this.favorite = true;
    this.norecords = false;
    var currentObj = {
      state_url: "",
      city: "",
      state: ""
    };
    currentObj.state_url = this.state_url;
    currentObj.city = this.currentDetails.city;
    currentObj.state = this.stateName; 
    localStorage.setItem(currentObj.city + currentObj.state,JSON.stringify(currentObj));
  }

  unfavorited(){
    this.favorite = false;
    localStorage.removeItem(this.cityObj + this.stateName);
  }

  delete(city,state){
    localStorage.removeItem(city + state);
    this.loadTable();
  }

  setCity(cityObj){
    this.currentDetails.city = cityObj;
  }

  setState(stateObj){
    console.log(stateObj);
    this.state_url = stateObj.items[0].link;
  }

  drawTemperature(){
    if(this.chart){
      this.chart.destroy();
    }
    var ctx = this.temperatureChart.nativeElement.getContext('2d');
    var temperatureData = [];
    var max = -1000;
    var min = 1000000;
    for (var i = 0; i <= 23; i++){
      if(Math.round(this.jsonObj.hourly.data[i].temperature) > max){
        max = Math.round(this.jsonObj.hourly.data[i].temperature);
      }
      if(Math.round(this.jsonObj.hourly.data[i].temperature) < min){
        min = Math.round(this.jsonObj.hourly.data[i].temperature);
      }
      temperatureData[i] = Math.round(this.jsonObj.hourly.data[i].temperature);
    }
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23'],
          datasets: [{
              label: 'temperature',
              data: temperatureData,
              backgroundColor: [
                  '#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee',
                  '#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee'
              ]
          }]
      },
      options: {
        scales: {
          xAxes: [{
            scaleLabel:{
              labelString: 'Time difference from current hour',
              display: true,
              fontSize: 14
            },
            ticks: {
                beginAtZero: true
            }
          }],
          yAxes: [{
            scaleLabel:{
              labelString: 'Fahrenheit',
              display: true,
              fontSize: 14
            },
            ticks: {
                beginAtZero: false,
                max: Math.round(max/10) * 10 + 10,
                min: Math.round(min/10) * 10 - 10,
                stepSize: 2
            }
          }]
        },
        legend: {
          onClick: (e) => e.stopPropagation()
        }
      }
    });
  }

  loadTable(){
    if(localStorage.length != 0){
      this.favoritedStuff = [];
      this.norecords = false;
      for(var i = 0; i < localStorage.length; i++){
        var jsonObj = JSON.parse(localStorage.getItem(localStorage.key(i)));
        var everyCity = {
          state_url: jsonObj.state_url,
          city: jsonObj.city,
          state: jsonObj.state
        };
        this.favoritedStuff.push(everyCity);
      }
    }
    else{
      this.norecords = true;
    }
  }

  drawPressure(){
    if(this.chart){
      this.chart.destroy();
    }
    var ctx1 = this.pressureChart.nativeElement.getContext('2d');
    var pressureData = [];
    var max = -1000;
    var min = 1000000;
    for (var i = 0; i <= 23; i++){
      if(Math.round(this.jsonObj.hourly.data[i].pressure) > max){
        max = Math.round(this.jsonObj.hourly.data[i].pressure);
      }
      if(Math.round(this.jsonObj.hourly.data[i].pressure) < min){
        min = Math.round(this.jsonObj.hourly.data[i].pressure);
      }
      pressureData[i] = Math.round(this.jsonObj.hourly.data[i].pressure);
    }
    this.chart = new Chart(ctx1, {
      type: 'bar',
      data: {
          labels: ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23'],
          datasets: [{
              label: 'pressure',
              data: pressureData,
              backgroundColor: [
                  '#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee',
                  '#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee'
              ]
          }]
      },
      options: {
        scales: {
          xAxes: [{
            scaleLabel:{
              labelString: 'Time difference from current hour',
              display: true,
              fontSize: 14
            },
            ticks: {
                beginAtZero: true
            }
          }],
          yAxes: [{
            scaleLabel:{
              labelString: 'Millibars',
              display: true,
              fontSize: 14
            },
            ticks: {
                beginAtZero: false,
                max: Math.round(max/10) * 10 + 10,
                min: Math.round(min/10) * 10 - 10,
                stepSize: 2
            }
          }]
        },
        legend: {
          onClick: (e) => e.stopPropagation()
        }
      }
    });
  }

  drawHumidity(){
    if(this.chart){
      this.chart.destroy();
    }
    var ctx2 = this.humidityChart.nativeElement.getContext('2d');
    var humidityData = [];
    var max = -1000;
    var min = 1000000;
    for (var i = 0; i <= 23; i++){
      if(Math.round(100*this.jsonObj.hourly.data[i].humidity) > max){
        max = Math.round(100*this.jsonObj.hourly.data[i].humidity);
      }
      if(Math.round(this.jsonObj.hourly.data[i].humidity) < min){
        min = Math.round(this.jsonObj.hourly.data[i].humidity);
      }
      humidityData[i] = Math.round(100*this.jsonObj.hourly.data[i].humidity);
    }
    this.chart = new Chart(ctx2, {
      type: 'bar',
      data: {
          labels: ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23'],
          datasets: [{
              label: 'humidity',
              data: humidityData,
              backgroundColor: [
                  '#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee',
                  '#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee'
              ]
          }]
      },
      options: {
        scales: {
          xAxes: [{
            scaleLabel:{
              labelString: 'Time difference from current hour',
              display: true,
              fontSize: 14
            },
            ticks: {
                beginAtZero: true
            }
          }],
          yAxes: [{
            scaleLabel:{
              labelString: '% Humidity',
              display: true,
              fontSize: 14
            },
            ticks: {
                beginAtZero: false,
                max: 110,
                min: 0,
                stepSize: 10
            }
          }]
        },
        legend: {
          onClick: (e) => e.stopPropagation()
        }
      }
    });
  }

  drawOzone(){
    if(this.chart){
      this.chart.destroy();
    }
    var ctx3 = this.ozoneChart.nativeElement.getContext('2d');
    var ozoneData = [];
    var max = -1000;
    var min = 1000000;
    for (var i = 0; i <= 23; i++){
      if(Math.round(this.jsonObj.hourly.data[i].ozone) > max){
        max = Math.round(this.jsonObj.hourly.data[i].ozone);
      }
      if(Math.round(this.jsonObj.hourly.data[i].ozone) < min){
        min = Math.round(this.jsonObj.hourly.data[i].ozone);
      }
      ozoneData[i] = Math.round(this.jsonObj.hourly.data[i].ozone);
    }
    this.chart = new Chart(ctx3, {
      type: 'bar',
      data: {
          labels: ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23'],
          datasets: [{
              label: 'ozone',
              data: ozoneData,
              backgroundColor: [
                  '#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee',
                  '#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee'
              ]
          }]
      },
      options: {
        scales: {
          xAxes: [{
            scaleLabel:{
              labelString: 'Time difference from current hour',
              display: true,
              fontSize: 14
            },
            ticks: {
                beginAtZero: true
            }
          }],
          yAxes: [{
            scaleLabel:{
              labelString: 'Dobson Units',
              display: true,
              fontSize: 14
            },
            ticks: {
                beginAtZero: false,
                max: Math.round(max/10) * 10 + 10,
                min: Math.round(min/10) * 10 - 25,
                stepSize: 5
            }
          }]
        },
        legend: {
          onClick: (e) => e.stopPropagation()
        }
      }
    });
  }

  drawVisibility(){
    if(this.chart){
      this.chart.destroy();
    }
    var ctx4 = this.visibilityChart.nativeElement.getContext('2d');
    var visibilityData = [];
    var max = -1000;
    var min = 1000000;
    for (var i = 0; i <= 23; i++){
      visibilityData[i] = this.jsonObj.hourly.data[i].visibility;
    }
    this.chart = new Chart(ctx4, {
      type: 'bar',
      data: {
          labels: ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23'],
          datasets: [{
              label: 'visibility',
              data: visibilityData,
              backgroundColor: [
                  '#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee',
                  '#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee'
              ]
          }]
      },
      options: {
        scales: {
          xAxes: [{
            scaleLabel:{
              labelString: 'Time difference from current hour',
              display: true,
              fontSize: 14
            },
            ticks: {
                beginAtZero: true
            }
          }],
          yAxes: [{
            scaleLabel:{
              labelString: 'Miles (Maximum 10)',
              display: true,
              fontSize: 14
            },
            ticks: {
                beginAtZero: false,
                max: 11,
                min: 0,
                stepSize: 1
            }
          }]
        },
        legend: {
          onClick: (e) => e.stopPropagation()
        }
      }
    });
  }

  favSearch(city,state){
    var favCityStateObj = {
      city:"",
      state:""
    }
    favCityStateObj.city = city;
    favCityStateObj.state = state;
    this.submitObject.submitFavCityState(favCityStateObj);
  }

  drawWindSpeed(){
    if(this.chart){
      this.chart.destroy();
    }
    var ctx5 = this.windSpeedChart.nativeElement.getContext('2d');
    var windSpeedData = [];
    var max = -1000;
    var min = 1000000;
    for (var i = 0; i <= 23; i++){
      if(Math.round(this.jsonObj.hourly.data[i].windSpeed) > max){
        max = Math.round(this.jsonObj.hourly.data[i].windSpeed);
      }
      if(Math.round(this.jsonObj.hourly.data[i].windSpeed) < min){
        min = Math.round(this.jsonObj.hourly.data[i].windSpeed);
      }
      windSpeedData[i] = Math.round(this.jsonObj.hourly.data[i].windSpeed);
    }
    this.chart = new Chart(ctx5, {
      type: 'bar',
      data: {
          labels: ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23'],
          datasets: [{
              label: 'windSpeed',
              data: windSpeedData,
              backgroundColor: [
                  '#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee',
                  '#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee'
              ]
          }]
      },
      options: {
        scales: {
          xAxes: [{
            scaleLabel:{
              labelString: 'Time difference from current hour',
              display: true,
              fontSize: 14
            },
            ticks: {
                beginAtZero: true
            }
          }],
          yAxes: [{
            scaleLabel:{
              labelString: 'Miles per hour',
              display: true,
              fontSize: 14
            },
            ticks: {
                beginAtZero: false,
                max: max + 2,
                min: 0,
                stepSize: 1
            }
          }]
        },
        legend: {
          onClick: (e) => e.stopPropagation()
        }
      }
    });
  }


  defaultHourly(){
    this.select.nativeElement.value = "hourlyTemperature";
    this.temperatureSelected = true; 
    this.pressureSelected = false;
    this.humiditySelected = false;
    this.ozoneSelected = false;
    this.visibilitySelected = false;
    this.windSpeedSelected = false;
    setTimeout(()=>{this.drawDefault()},500);
  }

  drawDefault(){
    if(this.chart){
      this.chart.destroy();
    }
    var ctx = this.temperatureChart.nativeElement.getContext('2d');
    var temperatureData = [];
    var max = -1000;
    var min = 1000000;
    for (var i = 0; i <= 23; i++){
      if(Math.round(this.jsonObj.hourly.data[i].temperature) > max){
        max = Math.round(this.jsonObj.hourly.data[i].temperature);
      }
      if(Math.round(this.jsonObj.hourly.data[i].temperature) < min){
        min = Math.round(this.jsonObj.hourly.data[i].temperature);
      }
      temperatureData[i] = Math.round(this.jsonObj.hourly.data[i].temperature);
    }
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23'],
          datasets: [{
              label: 'temperature',
              data: temperatureData,
              backgroundColor: [
                  '#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee',
                  '#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee','#a5d0ee'
              ]
          }]
      },
      options: {
        scales: {
          xAxes: [{
            scaleLabel:{
              labelString: 'Time difference from current hour',
              display: true,
              fontSize: 14
            },
            ticks: {
                beginAtZero: true
            }
          }],
          yAxes: [{
            scaleLabel:{
              labelString: 'Fahrenheit',
              display: true,
              fontSize: 14
            },
            ticks: {
                beginAtZero: false,
                max: Math.round(max/10) * 10 + 10,
                min: Math.round(min/10) * 10 - 10,
                stepSize: 2
            }
          }]
        },
        legend: {
          onClick: (e) => e.stopPropagation()
        }
      }
    });
  }

  hourlyChart(){
    if (this.select.nativeElement.value == "hourlyTemperature"){
      this.temperatureSelected = true; 
      this.pressureSelected = false;
      this.humiditySelected = false;
      this.ozoneSelected = false;
      this.visibilitySelected = false;
      this.windSpeedSelected = false;
      setTimeout(()=>{this.drawTemperature()},1);
    }
    else if (this.select.nativeElement.value == "hourlyPressure"){
      this.temperatureSelected = false; 
      this.pressureSelected = true;
      this.humiditySelected = false;
      this.ozoneSelected = false;
      this.visibilitySelected = false;
      this.windSpeedSelected = false;
      setTimeout(()=>{this.drawPressure()},1);
    }
    else if (this.select.nativeElement.value == "hourlyHumidity"){
      this.temperatureSelected = false; 
      this.pressureSelected = false;
      this.humiditySelected = true;
      this.ozoneSelected = false;
      this.visibilitySelected = false;
      this.windSpeedSelected = false;
      setTimeout(()=>{this.drawHumidity()},1);
    }
    else if (this.select.nativeElement.value == "hourlyOzone"){
      this.temperatureSelected = false; 
      this.pressureSelected = false;
      this.humiditySelected = false;
      this.ozoneSelected = true;
      this.visibilitySelected = false;
      this.windSpeedSelected = false;
      setTimeout(()=>{this.drawOzone()},1);
    }
    else if (this.select.nativeElement.value == "hourlyVisibility"){
      this.temperatureSelected = false; 
      this.pressureSelected = false;
      this.humiditySelected = false;
      this.ozoneSelected = false;
      this.visibilitySelected = true;
      this.windSpeedSelected = false;
      setTimeout(()=>{this.drawVisibility()},1);
    }
    else if (this.select.nativeElement.value == "hourlyWindSpeed"){
      this.temperatureSelected = false; 
      this.pressureSelected = false;
      this.humiditySelected = false;
      this.ozoneSelected = false;
      this.visibilitySelected = false;
      this.windSpeedSelected = true;
      setTimeout(()=>{this.drawWindSpeed()},1);
    }
  }

  drawCurrent(){
    if(this.chart){
      this.chart.destroy();
    }
  }

  drawHorizontalChart(){
    setTimeout(()=>{this.drawHorizontalChart2()},500);
  }

  drawHorizontalChart2(){
    if(this.chart){
      this.chart.destroy();
    }
    var inputJSON = this.jsonObj;
    var timeArray = new Array(this.jsonObj.daily.data.length);
    for (var i = 0; i < this.jsonObj.daily.data.length; i++){
      var time = this.jsonObj.daily.data[i].time;
      var d = new Date(time*1000);
      var month = '' + (d.getMonth() + 1);
			var day = '' + d.getDate();
      var year = d.getFullYear();
      if(day.length < 2){
        day = '0' + day;
      }
      var ddmyyyy = [day,month,year].join('/');
      timeArray[i] = ddmyyyy;
    }
    var city = this.currentDetails.city;
    CanvasJS.addColorSet("custom",["#A5D0EE"]);
    var chart = new CanvasJS.Chart("myWeeklyChart", {
      title:{
        text: "Weekly Weather",
        margin: 25             
      },
      animationEnabled: true,
      exportEnabled: false,
      dataPointWidth: 20,
      colorSet: "custom",
      axisX: {
        title: "Days"
      },
      axisY: {
        includeZero: false,
        title: "Temperature in Fahrenheit",
        interval: 10,
        gridThickness: 0
      },
      legend:{
        verticalAlign: "top"
      },
      data: [              
      {
        click: function(e){
          requestJSONWithTime(parseInt(e.dataPoint.name),city,e.dataPoint.label);
        },
        type: "rangeBar",
		    showInLegend: true,
		    yValueFormatString: "#",
		    indexLabel: "{y[#index]}",
		    legendText: "Day wise temperature range",
		    toolTipContent: "<b>{label}</b>: {y[0]} to {y[1]}",
        dataPoints: [
        { name:[this.jsonObj.daily.data[7].time],y:[this.jsonObj.daily.data[7].temperatureLow, this.jsonObj.daily.data[7].temperatureHigh], label: timeArray[7] },
        { name:[this.jsonObj.daily.data[6].time],y:[this.jsonObj.daily.data[6].temperatureLow, this.jsonObj.daily.data[6].temperatureHigh], label: timeArray[6] },
        { name:[this.jsonObj.daily.data[5].time],y:[this.jsonObj.daily.data[5].temperatureLow, this.jsonObj.daily.data[5].temperatureHigh], label: timeArray[5] },
        { name:[this.jsonObj.daily.data[4].time],y:[this.jsonObj.daily.data[4].temperatureLow, this.jsonObj.daily.data[4].temperatureHigh], label: timeArray[4] },
        { name:[this.jsonObj.daily.data[3].time],y:[this.jsonObj.daily.data[3].temperatureLow, this.jsonObj.daily.data[3].temperatureHigh], label: timeArray[3] },
        { name:[this.jsonObj.daily.data[2].time],y:[this.jsonObj.daily.data[2].temperatureLow, this.jsonObj.daily.data[2].temperatureHigh], label: timeArray[2] },
        { name:[this.jsonObj.daily.data[1].time],y:[this.jsonObj.daily.data[1].temperatureLow, this.jsonObj.daily.data[1].temperatureHigh], label: timeArray[1] },
        { name:[this.jsonObj.daily.data[0].time],y:[this.jsonObj.daily.data[0].temperatureLow, this.jsonObj.daily.data[0].temperatureHigh], label: timeArray[0] }
        ]
      }
      ]
    });
    chart.render();
    //let ModalComponentObject = new ModalComponent(this.modalService,this.modalObject);

    function requestJSONWithTime(inputTime,inputCity,inputDate){
      var xmlhttp = new XMLHttpRequest();

      console.log(inputTime);
      
  
      xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                var jsonObj = JSON.parse(xmlhttp.responseText);
                switch (jsonObj.currently.icon) {
                  case "clear-day":
                    var icon_url = "https://cdn3.iconfinder.com/data/icons/weather-344/142/sun-512.png";
                    break;
                  case "clear-night":
                    var icon_url = "https://cdn3.iconfinder.com/data/icons/weather-344/142/sun-512.png";
                    break;
                  case "partly-cloudy-day":
                    var icon_url = "https://cdn3.iconfinder.com/data/icons/weather-344/142/sunny-512.png";
                    break;
                  case "partly-cloudy-night":
                    var icon_url = "https://cdn3.iconfinder.com/data/icons/weather-344/142/sunny-512.png";
                    break;
                  case "rain":
                    var icon_url = "https://cdn3.iconfinder.com/data/icons/weather-344/142/rain-512.png";
                    break;
                  case "snow":
                    var icon_url = "https://cdn3.iconfinder.com/data/icons/weather-344/142/snow-512.png";
                    break;
                  case "sleet":
                    var icon_url = "https://cdn3.iconfinder.com/data/icons/weather-344/142/lightning-512.png";
                    break;
                  case "wind":
                    var icon_url = "https://cdn4.iconfinder.com/data/icons/the-weather-is-nice-today/64/weather_10-512.png";
                    break;
                  case "fog":
                    var icon_url = "https://cdn3.iconfinder.com/data/icons/weather-344/142/cloudy-512.png";
                    break;
                  case "cloudy":
                    var icon_url = "https://cdn3.iconfinder.com/data/icons/weather-344/142/cloud-512.png";
                    break;
                  default:
                    var icon_url = "";
                }
                var weeklyDetails = {
                  city: inputCity,
                  date: inputDate,
                  temperature: Math.round(jsonObj.currently.temperature),
                  summary: jsonObj.currently.summary,
                  icon: icon_url,
                  precipitation: Math.round(jsonObj.currently.precipIntensity * 100) / 100,
                  chanceOfRain: Math.round(jsonObj.currently.precipProbability * 10000) / 100,
                  windSpeed: Math.round(jsonObj.currently.windSpeed * 100) / 100,
                  humidity: Math.round(jsonObj.currently.humidity * 10000) / 100,
                  visibility: Math.round(jsonObj.currently.visibility* 100) / 100
                };
                sendModal(weeklyDetails);
                setJSON2(jsonObj);
                setModalDetails(weeklyDetails);
                openContent();
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
      var url = "https://weatherapp-csci571.appspot.com/time?lat=" + inputJSON.latitude + "&lng=" + inputJSON.longitude + "&time=" + inputTime;
      xmlhttp.open("GET", url, true);
      xmlhttp.send();
    }
    var openContent = () => {
      const modalRef = this.modalService.open(ModalContent);
      console.log(this.modalDetails.city);
      modalRef.componentInstance.modalDetails.city = this.modalDetails.city;
      modalRef.componentInstance.modalDetails.date = this.modalDetails.date;
      modalRef.componentInstance.modalDetails.temperature = this.modalDetails.temperature;
      modalRef.componentInstance.modalDetails.summary = this.modalDetails.summary;
      modalRef.componentInstance.modalDetails.icon = this.modalDetails.icon;
      modalRef.componentInstance.modalDetails.precipitation = this.modalDetails.precipitation;
      modalRef.componentInstance.modalDetails.chanceOfRain = this.modalDetails.chanceOfRain;
      modalRef.componentInstance.modalDetails.windSpeed = this.modalDetails.windSpeed;
      modalRef.componentInstance.modalDetails.humidity = this.modalDetails.humidity;
      modalRef.componentInstance.modalDetails.visibility = this.modalDetails.visibility;
    }
    var setModalDetails = (modalObj) => {
      this.modalDetails.city = modalObj.city;
      this.modalDetails.date = modalObj.date;
      this.modalDetails.temperature = modalObj.temperature;
      this.modalDetails.summary = modalObj.summary;
      this.modalDetails.icon = modalObj.icon;
      this.modalDetails.precipitation = modalObj.precipitation;
      this.modalDetails.chanceOfRain = modalObj.chanceOfRain;
      this.modalDetails.windSpeed = modalObj.windSpeed;
      this.modalDetails.humidity = modalObj.humidity;
      this.modalDetails.visibility = modalObj.visibility;
    }
    var sendModal = (weeklyDetails) => {
      console.log(weeklyDetails);
    }
    var setJSON2 = (jsonObj) => {
        this.jsonObj2 = jsonObj;
        console.log(this.jsonObj2);
    };
    
  }



  
}
