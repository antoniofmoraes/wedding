import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';

interface GalleryPhoto {
  url: string;
  alt: string;
  layout: 'large' | 'medium' | 'horizontal' | 'vertical';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  photos: GalleryPhoto[] = [];

  ngOnInit() {
    this.loadGalleryPhotos();
  }

  private loadGalleryPhotos() {
    // Quantidade de fotos disponíveis na pasta
    const photoCount = 10;
    const layouts: ('large' | 'medium' | 'horizontal' | 'vertical')[] = [
      'large', 'medium', 'medium', 'horizontal', 
      'medium', 'medium', 'vertical', 'medium'
    ];

    for (let i = 1; i <= photoCount; i++) {
      const photoNumber = i.toString().padStart(3, '0');
      this.photos.push({
        url: `/img/prewedding/Web-${photoNumber}.jpg`,
        alt: `Foto ${i} - Pré-wedding Tayná & Antonio`,
        layout: layouts[(i - 1) % layouts.length] || 'medium'
      });
    }
  }

  getLayoutClasses(layout: string): string {
    const layoutMap: { [key: string]: string } = {
      'large': 'col-span-2 row-span-2 rounded-3xl aspect-square',
      'medium': 'col-span-1 row-span-1 rounded-2xl aspect-square',
      'horizontal': 'col-span-2 row-span-1 rounded-3xl aspect-[2/1]',
      'vertical': 'col-span-1 row-span-2 rounded-3xl aspect-[1/2]'
    };
    return layoutMap[layout] || layoutMap['medium'];
  }
}
