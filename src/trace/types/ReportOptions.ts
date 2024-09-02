export type UserId = string | (() => string);

export interface ReportOptions {
  /**
   * 用于上报的用户 id
   */
  userId?: UserId;
  /**
   * 项目 id
   */
  id: string;
}
