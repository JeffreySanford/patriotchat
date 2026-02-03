import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

function handleBootstrapError(err: Error): void {
  console.error('Bootstrap error:', err);
}

platformBrowserDynamic().bootstrapModule(AppModule).catch(handleBootstrapError);
