import { uuidv4 } from '../../utils/uuid';

class BaseInfo {
  private static instance: BaseInfo;
  private userId: string;
  private sessionId: string | null = null;

  private constructor() {
    this.initSessionId();
    this.userId = this.getOrCreateUniqueUserId();
  }

  public static getInstance(): BaseInfo {
    if (!BaseInfo.instance) {
      BaseInfo.instance = new BaseInfo();
    }
    return BaseInfo.instance;
  }

  private initSessionId(): void {
    this.sessionId = uuidv4();
  }

  private getOrCreateUniqueUserId(): string {
    const storageKey = 'unique_user_id';
    let userId = localStorage.getItem(storageKey);
    if (!userId) {
      userId = uuidv4();
      localStorage.setItem(storageKey, userId);
    }
    return userId;
  }

  public setUserId(userId: string): void {
    localStorage.setItem('unique_user_id', userId);
    this.userId = userId;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getSessionId(): string {
    return this.sessionId!;
  }

  public getEventId(): string {
    return uuidv4();
  }

  public getUserAgent(): string {
    return navigator.userAgent;
  }

  public getBaseInfo() {
    return {
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      eventId: this.getEventId(),
      userAgent: this.getUserAgent(),
    };
  }
}

export default BaseInfo;
