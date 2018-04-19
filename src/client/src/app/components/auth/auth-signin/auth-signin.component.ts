import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FlgMember } from '@motionpicture/coa-service/lib/services/reserve';
import { UserService } from '../../../services/user/user.service';

@Component({
    selector: 'app-auth-signin',
    templateUrl: './auth-signin.component.html',
    styleUrls: ['./auth-signin.component.scss']
})
export class AuthSigninComponent implements OnInit {

    constructor(
        private router: Router,
        private user: UserService
    ) { }

    public ngOnInit() {
        this.user.setMember(FlgMember.Member);
        this.user.save();
        this.router.navigate(['/']);
    }
}