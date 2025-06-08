// import { Directive, HostListener, HostBinding } from '@angular/core';

// @Directive({
//   selector: '[appDropdown]',
//   standalone: false
// })
// export class DropdownDirective {
//   @HostBinding('class.open') isOpen = true;

//   @HostListener('click') toggleOpen() {
//     this.isOpen = !this.isOpen;
//   }
// }


import { Directive, HostListener, HostBinding, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appDropdown]',
  standalone: false
})
export class DropdownDirective {
  private isOpen = false;

  constructor(private elRef: ElementRef, private renderer: Renderer2) {}

  @HostListener('click') toggleOpen() {
    this.isOpen = !this.isOpen;

    const dropdownMenu = this.elRef.nativeElement.querySelector('.dropdown-menu');

    if (this.isOpen) {
      this.renderer.addClass(this.elRef.nativeElement, 'show');
      if (dropdownMenu) {
        this.renderer.addClass(dropdownMenu, 'show');
      }
    } else {
      this.renderer.removeClass(this.elRef.nativeElement, 'show');
      if (dropdownMenu) {
        this.renderer.removeClass(dropdownMenu, 'show');
      }
    }
  }
}