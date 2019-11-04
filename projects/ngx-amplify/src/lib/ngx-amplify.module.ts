import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxAmplifyConfig, NGX_AMPLIFY_CONFIG } from './common/interfaces/ngx-amplify.config';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports: []
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
