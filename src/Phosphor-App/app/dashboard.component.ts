import { Component, OnInit, Input } from '@angular/core';

import { Router } from '@angular/router-deprecated';

import { Http, Response } from '@angular/http';
import {Headers, RequestOptions} from '@angular/http';
import 'rxjs/Rx';

import { NounComponent } from './noun.component';
import { NounService } from './services/noun.service';

import { VerbService } from './services/verb.service';

import { CollectionComponent } from './collection.component';
import { DetailComponent } from './detail.component';

import { MOCKMODULES } from './util/mock-modules';

@Component({
  selector: 'my-dashboard',
  templateUrl: 'app/html/dashboard.component.html',
  styleUrls: ['app/css/dashboard.component.css'],
  directives: [NounComponent, CollectionComponent, DetailComponent]
})
export class DashboardComponent implements OnInit {

  expanded: boolean = false;

  subscription: any;

  psSubscription: any;

  verbs: any;

  selectedNoun: any;

  constructor(
    private router: Router,
    private http: Http,
    private nounService: NounService,
    private verbService: VerbService
  ) { }

  ngOnInit() {
    this.verbs = null;

    this.subscription = this.nounService.nounSelected$.subscribe(noun => this.getVerbs(noun));

    this.psSubscription = this.verbService.previewCommand$.subscribe(command =>  {
      this.updateConsole(command);
    });

  }

  getVerbs(noun) {

    this.selectedNoun = noun.name;

    this.verbs = null;

    this.http.get('/verbs?' + "noun=" + noun.name)
       .subscribe(
            res => {  console.log(res.json());  this.verbs = res.json(); },
            error => { console.log(error); this.verbs = null; }
    );
  }

  toggleConsole() {
    if (this.expanded) {
      var dash = document.getElementById("dash").style.height = "98%";
      var psconsole = document.getElementById("ps-console").style.height = "2%";
      var psicon = document.getElementById("ps-icon").style.height = "100%";
    }
    else {
      var dash = document.getElementById("dash").style.height = "85%";
      var psconsole = document.getElementById("ps-console").style.height = "15%";
      var psicon = document.getElementById("ps-icon").style.height = "20px";
    }

    this.expanded = !this.expanded;
  }

  getCommand(verb) {

    document.getElementById("details").style.display = "block";
    document.getElementById("output").style.display = "none";

    var command = verb + "-" + this.selectedNoun;

    this.updateConsole(command);

    document.getElementById("information").innerHTML = '<div *ngIf="!details" style="margin-top: 30%; margin-left: 7%;" class="c-progress f-indeterminate-regional" role="progressbar" aria-valuetext="Loading..." tabindex="0">'
        + '<span></span>'
        + '<span></span>'
        + '<span></span>'
        + '<span></span>'
        + '<span></span>'
        + '</div>';

    this.verbService.currentCommand = command;

    this.http.get('/command-details?' + "command=" + command)
       .subscribe(
            res => {  console.log(res.json());  this.verbService.setVerbDetails(res); },
            error => { console.log(error); }
    );

    //Get-Command New-Service -Syntax
  }

  updateConsole(command) {
    var old = document.getElementById("ps-command").innerHTML;
    document.getElementById("ps-command").innerHTML = old + "<span>" + command + "</span> <br>";

    //A way to quickly scroll to the bottom
    document.getElementById("ps-console").scrollTop = document.getElementById("ps-console").scrollHeight;
  }


}
