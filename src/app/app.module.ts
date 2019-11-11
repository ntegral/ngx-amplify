import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxAmplifyModule } from 'projects/ngx-amplify/src/public-api';

@NgModule({
    declarations: [AppComponent],
    imports: [
        AppRoutingModule,
        BrowserModule.withServerTransition({ appId: 'serverApp' }),
        FormsModule,
        ReactiveFormsModule,
        NgxAmplifyModule.forRoot({
            region: 'us-east-1',
            userPoolId: 'us-east-1_kT3FBpRxL',
            appId: '1r9vg3ob81jamk62mjepejd3dq',
            idpUrl: `cognito-idp.us-east-1.amazonaws.com`,
            identityPoolId: 'us-east-1:08f3112b-cc65-49e4-8063-81f16cccd1ab',
        }),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
