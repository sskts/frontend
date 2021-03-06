import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BaseComponent } from './components/pages/base/base.component';
import { AlertModalComponent } from './components/parts/alert-modal/alert-modal.component';
import { ButtonsComponent } from './components/parts/buttons/buttons.component';
import { ConfirmModalComponent } from './components/parts/confirm-modal/confirm-modal.component';
import { FooterComponent } from './components/parts/footer/footer.component';
import { HeaderComponent } from './components/parts/header/header.component';
import { IconComponent } from './components/parts/icon/icon.component';
import { LoadingComponent } from './components/parts/loading/loading.component';
import { ModalComponent } from './components/parts/modal/modal.component';
import { ScreenComponent } from './components/parts/screen/screen.component';
import { SiteSealComponent } from './components/parts/site-seal/site-seal.component';
import { DurationPipe, LibphonenumberFormatPipe, TimeFormatPipe } from './pipes';

const components = [
  BaseComponent,
  ButtonsComponent,
  FooterComponent,
  HeaderComponent,
  IconComponent,
  LoadingComponent,
  ModalComponent,
  ScreenComponent,
  SiteSealComponent,
];

const entryComponents = [
  AlertModalComponent,
  ConfirmModalComponent,
];

const pipes = [
  DurationPipe,
  LibphonenumberFormatPipe,
  TimeFormatPipe
];

@NgModule({
  declarations: [
    ...components,
    ...entryComponents,
    ...pipes
  ],
  entryComponents,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ModalModule,
  ],
  exports: [
    ...components,
    ...entryComponents,
    ...pipes,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: []
})
export class SharedModule { }
