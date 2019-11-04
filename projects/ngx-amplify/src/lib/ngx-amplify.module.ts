import { NgModule, ModuleWithProviders } from '@angular/core';
import { NgxAmplifyComponent } from './ngx-amplify.component';
import { CommonModule } from '@angular/common';

import { NgxAmplifyConfig, NGX_AMPLIFY_CONFIG } from './common';



@NgModule({
  declarations: [NgxAmplifyComponent],
  imports: [
    CommonModule
  ],
  exports: [NgxAmplifyComponent]
})
export class NgxAmplifyModule { 
  static forRoot(config: NgxAmplifyConfig): ModuleWithProviders {
    return {
      ngModule: NgxAmplifyModule,
      providers: [
        {
          provide: NGX_AMPLIFY_CONFIG,
          useValue: config
        }
      ]
    }
  }
}
