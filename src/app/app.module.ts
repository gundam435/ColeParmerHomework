import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { TripDataService } from './services/tripdata.service';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [TripDataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
