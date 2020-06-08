import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal,NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WeeklyService } from '../services/weekly.service';

@Component({
  selector: 'app-modal-content',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalContent {

  @Input() name;
  @Input() modalObj;

  @Input() modalDetails = {
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

  constructor(public activeModal: NgbActiveModal,
              private modalObject : WeeklyService) { }

}
