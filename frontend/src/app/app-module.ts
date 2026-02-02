import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { App } from './app';
import { appRoutes } from './app.routes';
import { FooterComponent } from './footer/footer.component.ts';
import { HeaderComponent } from './header/header.component';
import { MainStageComponent } from './main-stage/main-stage.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { LandingPageComponent } from './pages/landing/landing-page.component';
import { VscodeGuidePageComponent } from './pages/vscode-guide/vscode-guide-page.component';
import { GuardrailsPageComponent } from './pages/guardrails/guardrails-page.component';
import { HistoryPageComponent } from './pages/history/history-page.component';
import { MetricsPageComponent } from './pages/metrics/metrics-page.component';
import { StatusPageComponent } from './pages/status/status-page.component';

@NgModule({
  declarations: [
    App,
    HeaderComponent,
    SidebarComponent,
    MainStageComponent,
    FooterComponent,
    LandingPageComponent,
    VscodeGuidePageComponent,
    HistoryPageComponent,
    GuardrailsPageComponent,
    MetricsPageComponent,
    StatusPageComponent,
  ],
  imports: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes, {
      scrollPositionRestoration: 'top',
    }),
  ],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
