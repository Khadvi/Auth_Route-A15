import { Component } from "@angular/core";

@Component({
    selector: 'app-loading-spinner',
    template: '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>',
    styleUrls: ['./loading-spinner.component.css'],
    standalone: false
})

export class LoadingSpinner {}