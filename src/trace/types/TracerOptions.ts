export interface TracerOptions {
  /**
   * 请求的 Http Status Code 是否进行追踪
   * 返回 true 表示不追踪
   * @default (status) => status < 400  && status >= 100
   * @param status http status code
   * @returns
   */
  checkDisabledHttpStatus?: (status: number) => boolean;
  /**
   * 请求的 url 和 method 是否进行追踪
   * 返回 true 表示不追踪
   * @default 除上报的地址，其他地址都进行追踪
   * @param status http status code
   * @returns
   */
  checkDisabledUrl?: (url: string, method: string) => boolean;
}
