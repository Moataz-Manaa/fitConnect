import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.css'],
})
export class VideoCallComponent implements OnInit {
  IsCoachIn: boolean = false;
  IsClientIn: boolean = false;
  planningId: string = '';
  roomId: string = '';
  userInfo: any = null;

  constructor(
    private service: CrudService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.IsCoachIn = this.service.isCoachIn();
    this.IsClientIn = this.service.isClientIn();
    this.userInfo = this.service.userDetails();

    // Get planning ID from route parameters
    this.route.params.subscribe((params) => {
      this.planningId = params['planningId'] || '';
      if (this.planningId) {
        this.generateRoomId();
        this.initializeZegoUIKit();
      } else {
        console.error('Planning ID is required for video call');
        this.router.navigate(['/dashboard']); // Redirect if no planning ID
      }
    });
  }

  /**
   * Generate a consistent room ID based on planning ID
   * This ensures coach and clients use the same room
   */
  generateRoomId(): void {
    // Create a consistent room ID using planning ID
    this.roomId = `planning_${this.planningId}_room`;
    console.log('Generated Room ID:', this.roomId);
  }

  /**
   * Alternative method: Generate room ID from reservation data
   * Use this if you want to include coach ID for extra security
   */
  generateRoomIdWithCoach(coachId: number): void {
    this.roomId = `coach_${coachId}_planning_${this.planningId}`;
    console.log('Generated Room ID with Coach:', this.roomId);
  }

  initializeZegoUIKit(): void {
    const appID = 1354934854; // Replace with your actual ZegoCloud AppID
    const serverSecret = '3e14bdcd62d2a05dc4bccbfc27210266'; // Replace with your actual ServerSecret

    // Generate unique user ID
    const userID = this.generateUserId();
    const userName = this.getUserName();

    console.log('Initializing video call for:', {
      userID,
      userName,
      roomId: this.roomId,
      isCoach: this.IsCoachIn,
      isClient: this.IsClientIn,
    });

    // Generate token for the user
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      this.roomId,
      userID,
      userName
    );

    // Create and join the room
    const zegoUIKitPrebuilt = ZegoUIKitPrebuilt.create(kitToken);
    zegoUIKitPrebuilt.joinRoom({
      container: document.getElementById('zego-container') as HTMLElement,
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
      maxUsers: 10, // Allow multiple clients per coach
      sharedLinks: [
        {
          name: 'Personal link',
          url: `${window.location.origin}/call/${this.planningId}`,
        },
      ],
      // Add callback for user join/leave events
      onJoinRoom: () => {
        console.log('Successfully joined room:', this.roomId);
      },
      onLeaveRoom: () => {
        console.log('Left room:', this.roomId);
        this.router.navigate(['/dashboard']);
      },
    });
  }

  /**
   * Generate unique user ID based on user type and info
   */
  generateUserId(): string {
    const timestamp = Date.now();

    if (this.IsCoachIn) {
      return `coach_${this.userInfo.id}_${timestamp}`;
    } else if (this.IsClientIn) {
      return `client_${this.userInfo.id}_${timestamp}`;
    } else {
      return `user_${timestamp}`;
    }
  }

  /**
   * Get user display name
   */
  getUserName(): string {
    if (!this.userInfo) {
      return 'Anonymous User';
    }

    const fullName = `${this.userInfo.nom || ''} ${
      this.userInfo.prenom || ''
    }`.trim();

    if (this.IsCoachIn) {
      return `Coach ${fullName}`;
    } else if (this.IsClientIn) {
      return `Client ${fullName}`;
    } else {
      return fullName || 'User';
    }
  }

  /**
   * Check if user can join the call based on session timing
   */
  canJoinCall(planningDate: Date, debut: string, fin: string): boolean {
    const today = new Date();
    const sessionDate = new Date(planningDate);

    // Parse time
    const [debutHour, debutMinute] = debut.split(':').map(Number);
    const [finHour, finMinute] = fin.split(':').map(Number);

    const debutTime = new Date(sessionDate);
    debutTime.setHours(debutHour, debutMinute, 0, 0);

    const finTime = new Date(sessionDate);
    finTime.setHours(finHour, finMinute, 0, 0);

    // Allow joining 10 minutes before session starts and until session ends
    const joinTime = new Date(debutTime.getTime() - 10 * 60 * 1000); // 10 minutes before

    return today >= joinTime && today <= finTime;
  }

  /**
   * Leave the call and return to dashboard
   */
  leaveCall(): void {
    if (confirm("Êtes-vous sûr de vouloir quitter l'appel ?")) {
      // The onLeaveRoom callback will handle navigation
      window.location.reload(); // Force reload to clean up ZegoUIKit
    }
  }
}
