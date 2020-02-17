import { Component } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { StorageService, AuthService, IAuthUser, AuthUser } from 'ngx-amplify';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    title = 'ngx-amplify-starter';
    loginForm: FormGroup;
    authUser: IAuthUser = AuthUser.Factory()

    constructor(
        private storage: StorageService,
        private auth: AuthService, 
        private fb: FormBuilder) {
        this.buildForm();

        this.storage.getFile('ufc-atlanta.jpg','events').then(
            (result) => {
                console.log('file location', result);
            }
        ).catch(
            (err) => { console.error('err getting file', err)}
        );

        // this.storage.list('public/events/').catch((err) => { console.log('err listing files', err)});

        this.auth.currentAuthUser().then(
            (user) => {
                console.log('authUser', user);
                this.authUser = Object.assign({},this.authUser, user);
            }
        )

        /* this.auth.authUserState$.subscribe((data) => {
            console.log('data:sub', data);
        },(err) => {
            console.log('data:sub:err',err);
        }) */
    }

    buildForm() {
        let self = this;

        self.loginForm = this.fb.group(
            {
                username: [
                    '',
                    Validators.compose([
                        Validators.required,
                        Validators.minLength(5),
                        Validators.maxLength(25),
                    ]),
                ],
                password: ['', Validators.compose([Validators.required])],
            },
            { updateOn: 'blur' },
        );
    }

    onEvent(event: string) {
        let self = this;

        if (event === 'login') {
            let result = self.auth
                .signIn(self.loginForm.value)
                .then(result => {
                    console.log('authUser', result);
                    this.authUser = Object.assign({},this.authUser, result);
                })
                .catch(err => {
                    console.error('signIn', err);
                });
        }

        if (event === 'signOut') {
            console.log('signOut', event);
            self.auth.signOut().then((result) => {
                this.authUser = Object.assign({}, AuthUser.Factory());
            });
        }
    }
}
