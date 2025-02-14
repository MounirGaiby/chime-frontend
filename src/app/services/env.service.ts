import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  private env: { [key: string]: string } = {
    API_URL: environment.apiUrl
  };

  get(key: string): string {
    return this.env[key] || '';
  }

  get apiUrl(): string {
    return this.env['API_URL'];
  }
} 