import { Component, Output, EventEmitter } from '@angular/core';

export interface SongLengthOption {
  label: string;
  seconds: number;
  description: string;
}

@Component({
  selector: 'app-song-length-dialog',
  templateUrl: './song-length-dialog.component.html',
  styleUrls: ['./song-length-dialog.component.scss'],
  standalone: false,
})
export class SongLengthDialogComponent {
  @Output() selected: EventEmitter<number> = new EventEmitter<number>();
  @Output() cancelled: EventEmitter<void> = new EventEmitter<void>();

  isOpen: boolean = false;

  songLengthOptions: SongLengthOption[] = [
    {
      label: '76 seconds',
      seconds: 76,
      description: 'Viral hit - punchy hook with minimal structure, perfect for social media',
    },
    {
      label: '3 minutes',
      seconds: 180,
      description: 'Classic pop - verse, chorus, bridge structure with full arrangement',
    },
    {
      label: '5 minutes',
      seconds: 300,
      description: 'Epic production - extended sections, instrumental breaks, and dynamic transitions',
    },
    {
      label: 'As long as needed',
      seconds: 600,
      description: 'Experimental - let the AI create the perfect length and style for your idea',
    },
  ];

  openDialog(): void {
    this.isOpen = true;
  }

  closeDialog(): void {
    this.isOpen = false;
    this.cancelled.emit();
  }

  selectLength(seconds: number): void {
    this.isOpen = false;
    this.selected.emit(seconds);
  }
}
