import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { factory } from '@cinerino/sdk';
import { ErrorService, IMovieTicket, PurchaseService } from '../../../../../services';

@Component({
    selector: 'app-purchase-mg-confirm',
    templateUrl: './purchase-mg-confirm.component.html',
    styleUrls: ['./purchase-mg-confirm.component.scss']
})
export class PurchaseMgConfirmComponent implements OnInit {
    public tickets: IMovieTicket[];
    constructor(
        public purchase: PurchaseService,
        private router: Router,
        private error: ErrorService
    ) { }

    public ngOnInit() {
        window.scrollTo(0, 0);
        this.tickets = this.purchase.data.movieTickets.filter(m => {
            return m.paymentMethodType === factory.chevre.paymentMethodType.MGTicket;
        });
        if (this.tickets.length === 0) {
            this.error.redirect(new Error('status is different'));
        }
        // console.log(this.purchase.data.mvtkTickets);
    }

    public onSubmit() {
        this.router.navigate(['/purchase/ticket']);
    }

}
