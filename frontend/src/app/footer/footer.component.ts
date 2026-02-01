import { Component } from '@angular/core';

interface FooterLink {
  label: string;
  url: string;
}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: false
})
export class FooterComponent {
  readonly currentYear: number = new Date().getFullYear();

  readonly links: FooterLink[] = [
    { label: 'Design tokens', url: '#' },
    { label: 'Assistant playbook', url: '#' },
    { label: 'Support', url: '#' },
  ];
}
