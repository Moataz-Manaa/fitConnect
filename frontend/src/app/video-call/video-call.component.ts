import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { Subscription, firstValueFrom } from 'rxjs';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.css'],
})
export class VideoCallComponent implements OnInit, OnDestroy {
  @ViewChild('videoContainer', { static: true }) private container!: ElementRef<HTMLDivElement>;
  status = '';
  private routeSubscription?: Subscription;
  private room?: ZegoUIKitPrebuilt;
  private requestId = 0;

  constructor(
    private service: CrudService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const requestId = ++this.requestId;
      this.room?.destroy();
      this.room = undefined;
      const planningId = params.get('planningId');
      if (!planningId || !/^[1-9][0-9]*$/.test(planningId)) {
        this.status = 'Cette séance est introuvable.';
        return;
      }

      this.status = 'Connexion à la séance…';
      void this.joinRoom(planningId, requestId);
    });
  }

  ngOnDestroy(): void {
    ++this.requestId;
    this.routeSubscription?.unsubscribe();
    this.room?.destroy();
  }

  private async joinRoom(planningId: string, requestId: number): Promise<void> {
    try {
      const access = await firstValueFrom(this.service.getVideoRoomToken(planningId));
      if (requestId !== this.requestId) return;
      const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt');
      if (requestId !== this.requestId) return;

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
        access.appId, access.token, access.roomId, access.userId, access.userName
      );
      this.room = ZegoUIKitPrebuilt.create(kitToken);
      this.room.joinRoom({
        container: this.container.nativeElement,
        scenario: { mode: ZegoUIKitPrebuilt.VideoConference },
        maxUsers: 10,
        sharedLinks: [
          { name: 'Lien de la séance', url: `${window.location.origin}/call/${planningId}` },
        ],
        onLeaveRoom: () => {
          if (requestId === this.requestId) void this.router.navigate(['/dashboard']);
        },
      });
      this.status = '';
    } catch (error) {
      if (requestId !== this.requestId) return;
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          this.status = 'Connectez-vous pour rejoindre la séance.';
          return;
        }
        if (error.status === 403) {
          this.status = 'Vous ne pouvez pas rejoindre cette séance.';
          return;
        }
        if (error.status === 503) {
          this.status = 'Le service vidéo est indisponible.';
          return;
        }
      }
      this.status = 'Impossible de charger la séance. Veuillez réessayer.';
    }
  }
}
