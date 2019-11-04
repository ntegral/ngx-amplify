import { Component } from '@angular/core';
import { AuthService } from 'projects/ngx-amplify/src/public-api';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  title = 'ngx-amplify-starter';
  loginForm: FormGroup;

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
  ) {
    this.buildForm();
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
      let result = self.auth.signIn(self.loginForm.value).then(
        (result) => {
          console.log('authUser', result);
        }
      ).catch(
        (err) => {
          console.error('signIn', err);
        }
      )
    }

    if (event === 'signOut') {
      console.log('signOut', event);
      self.auth.signOut();
    }
  }
}
