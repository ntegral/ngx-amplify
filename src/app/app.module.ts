import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxAmplifyModule, TokenInterceptor } from 'ngx-amplify';

@NgModule({
    declarations: [AppComponent],
    imports: [
        AppRoutingModule,
        BrowserModule.withServerTransition({ appId: 'serverApp' }),
        FormsModule,
        ReactiveFormsModule,
        NgxAmplifyModule.forRoot({
            region: 'us-east-x',
            userPoolId: 'us-east-1_uXitiM7tx',
            appId: 'oj4deslvu136a6gsaoauujrx',
            idpUrl: `cognito-idp.us-east-1.amazonaws.com`,
            identityPoolId: 'us-east-1:7cad9b05-902e-4da5-aec2-5410fe7efc8x',
            storage: {
                bucketName: 'xx',
                bucketRegion: 'us-east-x',
                defaultLevel: 'public',
                folderLevel: 'public'
            }
        }),
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
