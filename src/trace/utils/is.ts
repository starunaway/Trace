export function isConstructable(target: any) {
  // 检查值是否是函数
  if (typeof target !== 'function') {
    return false;
  }

  // 检查函数是否有 prototype 属性
  if (!target.prototype) {
    return false;
  }

  // 检查 prototype 属性是否是一个对象
  if (typeof target.prototype !== 'object') {
    return false;
  }

  return true;
}
