import { Component,Input,Output,EventEmitter,ElementRef,OnDestroy,HostListener,ViewChildren,QueryList,AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-combobox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './combobox.html',
  styleUrls: ['./combobox.scss']
})
export class Combobox implements OnDestroy, AfterViewInit {
  @Input() options: string[] = [];
  @Input() placeholder: string = 'Select options';
  @Input() searchable: boolean = true;
  @Input() disabledOptions: string[] = [];

  @Output() valueChange = new EventEmitter<string[]>();

  searchText: string = '';
  isOpen: boolean = false;

  selected: string[] = [];
  highlightedIndex: number = -1;

  @ViewChildren('optionItem') optionItems!: QueryList<ElementRef>;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.optionItems.changes.subscribe(() => {
      this.scrollHighlightedIntoView();
    });
  }

  get filteredOptions(): string[] {
    if (!this.searchable || !this.searchText.trim()) return this.options;
    return this.options.filter(o =>
      o.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  get displayPlaceholder(): string {
    if (this.selected.length === 0) return this.placeholder;

    const joined = this.selected.join(', ');
    return joined.length > 25 ? joined.slice(0, 25) + '...' : joined;
  }

  get tooltipText(): string {
    return this.selected.length > 0 ? this.selected.join(', ') : '';
  }

  openDropdown(): void {
    this.isOpen = true;
    this.highlightedIndex = -1;
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.highlightedIndex = -1;
  }

  closeDropdown(): void {
    this.isOpen = false;
    this.highlightedIndex = -1;
  }

  selectOption(option: string): void {
    if (this.disabledOptions.includes(option)) return;

    const index = this.selected.indexOf(option);
    if (index === -1) {
      this.selected.push(option);
    } else {
      this.selected.splice(index, 1);
    }

    this.valueChange.emit([...this.selected]);
  }

  onInputChange(value: string) {
    this.searchText = value;
    if (!this.isOpen) {
      this.openDropdown();
    }
  }

  isDisabled(option: string): boolean {
    return this.disabledOptions.includes(option);
  }

  isSelected(option: string): boolean {
    return this.selected.includes(option);
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: EventTarget | null) {
    if (
      this.isOpen &&
      target instanceof HTMLElement &&
      !this.elementRef.nativeElement.contains(target)
    ) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.isOpen) return;

    const options = this.filteredOptions;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex = (this.highlightedIndex + 1) % options.length;
        this.scrollHighlightedIntoView();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex =
          this.highlightedIndex > 0
            ? this.highlightedIndex - 1
            : options.length - 1;
        this.scrollHighlightedIntoView();
        break;

      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex >= 0 && this.highlightedIndex < options.length) {
          this.selectOption(options[this.highlightedIndex]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.isOpen = false;
        this.highlightedIndex = -1;
        break;
    }
  }

  scrollHighlightedIntoView() {
    setTimeout(() => {
      const items = this.optionItems.toArray();
      if (items[this.highlightedIndex]) {
        items[this.highlightedIndex].nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }, 0);
  }

  ngOnDestroy(): void {
    this.closeDropdown();
  }
}
