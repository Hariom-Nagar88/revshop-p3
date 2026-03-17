import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stars-wrap" [class.interactive]="interactive">
      <span *ngFor="let s of stars; let i = index"
            class="material-icons star"
            [class.filled]="(hovered || value) > i"
            [class.half]="!interactive && hasHalf && i === fullStars"
            (mouseenter)="interactive && (hovered = i + 1)"
            (mouseleave)="interactive && (hovered = 0)"
            (click)="interactive && rate(i + 1)">
        {{ (!interactive && hasHalf && i === fullStars) ? 'star_half' : ((hovered || value) > i ? 'star' : 'star_border') }}
      </span>
      <span *ngIf="showCount && count" class="count-text">({{count}})</span>
    </div>
  `,
  styles: [`
    .stars-wrap { display: inline-flex; align-items: center; gap: 1px; }
    .star { font-size: 18px; color: #ddd; transition: color .15s; }
    .star.filled { color: #f9a825; }
    .interactive .star { cursor: pointer; }
    .interactive .star:hover { color: #f9a825; transform: scale(1.1); }
    .count-text { font-size: 13px; color: #878787; margin-left: 6px; }
  `]
})
export class StarRatingComponent {
  @Input() value = 0;
  @Input() count = 0;
  @Input() showCount = false;
  @Input() interactive = false;
  @Input() size = 18;
  @Output() rated = new EventEmitter<number>();

  hovered = 0;
  stars = [1, 2, 3, 4, 5];

  get fullStars(): number { return Math.floor(this.value); }
  get hasHalf(): boolean  { return this.value % 1 >= 0.5; }

  rate(score: number) {
    this.rated.emit(score);
  }
}
