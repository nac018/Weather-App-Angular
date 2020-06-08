import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule,ReactiveFormsModule } from '@angular/forms'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormComponent } from './form/form.component';
import { ResultComponent } from './result/result.component';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ResultsService } from './services/results.service';
import { AlertModule } from 'ngx-bootstrap';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalContent } from './modal/modal.component';
import { WeeklyService } from './services/weekly.service';
import { MatButtonModule,MatFormFieldModule,MatInputModule,MatRippleModule,MatAutocompleteModule } from '@angular/material'

@NgModule({
  declarations: [
    AppComponent,
    FormComponent,
    ResultComponent,
    ModalContent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AlertModule.forRoot(),
    NgbModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatAutocompleteModule
  ],
  exports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatAutocompleteModule
  ],
  providers: [ResultsService,WeeklyService],
  bootstrap: [AppComponent],
  entryComponents: [ModalContent]
})
export class AppModule { }
