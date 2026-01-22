import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';

interface GalleryPhoto {
  url: string;
  alt: string;
}

interface FAQ {
  pergunta: string;
  resposta: string;
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
  selectedPhoto: GalleryPhoto | null = null;
  selectedPhotoIndex: number = -1;
  private touchStartX: number = 0;
  private touchEndX: number = 0;
  faqs: FAQ[] = [
    {
      pergunta: 'Como confirmo minha presença?',
      resposta: 'Você receberá orientações para confirmação por whatsapp. Caso ainda não tenha recebido até o dia 23/01, nos contate pelo whatsapp.'
    },
    {
      pergunta: 'Crianças estão convidadas?',
      resposta: 'Com certeza! E elas deverão ser incluídas na confirmação de presença.'
    },
    {
      pergunta: 'Haverá espaço para crianças?',
      resposta: 'A chácara conta com parquinho para crianças, além de amplo espaço externo, dando bastante espaço para as crianças brincarem.'
    }
  ];

  ngOnInit() {
    this.loadGalleryPhotos();
  }

  private loadGalleryPhotos() {
    const photoCount = 12;

    for (let i = 1; i <= photoCount; i++) {
      const photoNumber = i.toString().padStart(3, '0');
      this.photos.push({
        url: `/img/prewedding/${photoNumber}.jpeg`,
        alt: `Foto ${i} - Pré-wedding Tayná & Antonio`
      });
    }
  }

  openPhoto(photo: GalleryPhoto) {
    this.selectedPhoto = photo;
    this.selectedPhotoIndex = this.photos.indexOf(photo);
  }

  closePhoto() {
    this.selectedPhoto = null;
    this.selectedPhotoIndex = -1;
  }

  nextPhoto() {
    if (this.selectedPhotoIndex < this.photos.length - 1) {
      this.selectedPhotoIndex++;
      this.selectedPhoto = this.photos[this.selectedPhotoIndex];
    }
  }

  previousPhoto() {
    if (this.selectedPhotoIndex > 0) {
      this.selectedPhotoIndex--;
      this.selectedPhoto = this.photos[this.selectedPhotoIndex];
    }
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe() {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next photo
        this.nextPhoto();
      } else {
        // Swipe right - previous photo
        this.previousPhoto();
      }
    }
  }
}
